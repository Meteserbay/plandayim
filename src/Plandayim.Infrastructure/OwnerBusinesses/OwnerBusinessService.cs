using Microsoft.EntityFrameworkCore;
using Plandayim.Application.Common;
using Plandayim.Application.OwnerBusinesses;
using Plandayim.Domain.Businesses;
using Plandayim.Infrastructure.Persistence;
using Plandayim.Infrastructure.Storage;

namespace Plandayim.Infrastructure.OwnerBusinesses;

public sealed class OwnerBusinessService : IOwnerBusinessService
{
    private static readonly int[] AllowedStatsDays = [7, 30, 90];

    // Türkiye yaz saati uygulamadığı için sabit UTC+3 kullanılır.
    private const int TurkeyUtcOffsetHours = 3;

    private const int MaxCampaignsPerBusiness = 10;

    private const int MaxImagesPerBusiness = 12;

    private readonly PlandayimDbContext _dbContext;
    private readonly IFileStorage _fileStorage;

    public OwnerBusinessService(
        PlandayimDbContext dbContext,
        IFileStorage fileStorage)
    {
        _dbContext = dbContext;
        _fileStorage = fileStorage;
    }

    public async Task<BusinessStatsDto> GetStatsAsync(
        long userId,
        long businessId,
        int days,
        CancellationToken cancellationToken = default)
    {
        if (!AllowedStatsDays.Contains(days))
        {
            throw new RequestValidationException(
                "Geçersiz tarih aralığı. 7, 30 veya 90 gün seçilebilir.");
        }

        await EnsureOwnerAsync(userId, businessId, cancellationToken);

        var today = DateOnly.FromDateTime(
            DateTime.UtcNow.AddHours(TurkeyUtcOffsetHours));
        var firstDay = today.AddDays(-(days - 1));
        var previousFirstDay = firstDay.AddDays(-days);

        var periodStartUtc = ToUtc(firstDay);
        var previousStartUtc = ToUtc(previousFirstDay);

        // Seçilen dönem ve bir önceki eşit uzunluktaki dönem tek sorguda
        // günlük ve tür bazında gruplanır.
        var rows = await _dbContext.BusinessInteractions
            .AsNoTracking()
            .Where(x =>
                x.BusinessId == businessId &&
                x.CreatedAtUtc >= previousStartUtc)
            .GroupBy(x => new
            {
                Day = x.CreatedAtUtc.AddHours(TurkeyUtcOffsetHours).Date,
                x.Type
            })
            .Select(g => new InteractionCountRow(
                g.Key.Day,
                g.Key.Type,
                g.Count()))
            .ToListAsync(cancellationToken);

        var current = rows
            .Where(x => x.Day >= firstDay.ToDateTime(TimeOnly.MinValue))
            .ToList();
        var previous = rows
            .Where(x => x.Day < firstDay.ToDateTime(TimeOnly.MinValue))
            .ToList();

        var daily = Enumerable.Range(0, days)
            .Select(offset =>
            {
                var date = firstDay.AddDays(offset);
                var dayRows = current
                    .Where(x => DateOnly.FromDateTime(x.Day) == date)
                    .ToList();

                return new DailyInteractionsDto(
                    date,
                    Sum(dayRows, BusinessInteractionType.ProfileView),
                    Sum(dayRows, BusinessInteractionType.Phone) +
                    Sum(dayRows, BusinessInteractionType.WhatsApp) +
                    Sum(dayRows, BusinessInteractionType.Website));
            })
            .ToList();

        return new BusinessStatsDto(
            days,
            ToTotals(current),
            ToTotals(previous),
            daily);

        static int Sum(
            IEnumerable<InteractionCountRow> source,
            BusinessInteractionType type)
        {
            return source
                .Where(x => x.Type == type)
                .Sum(x => x.Count);
        }

        static InteractionTotalsDto ToTotals(
            IReadOnlyCollection<InteractionCountRow> source)
        {
            return new InteractionTotalsDto(
                Sum(source, BusinessInteractionType.ProfileView),
                Sum(source, BusinessInteractionType.Phone),
                Sum(source, BusinessInteractionType.WhatsApp),
                Sum(source, BusinessInteractionType.Website),
                Sum(source, BusinessInteractionType.CampaignCodeCopy));
        }

        DateTime ToUtc(DateOnly turkeyDate)
        {
            return turkeyDate
                .ToDateTime(TimeOnly.MinValue)
                .AddHours(-TurkeyUtcOffsetHours);
        }
    }

    public async Task<OwnerBusinessProfileDto> GetProfileAsync(
        long userId,
        long businessId,
        CancellationToken cancellationToken = default)
    {
        var business = await GetOwnedBusinessAsync(
            userId,
            businessId,
            cancellationToken);

        return ToProfileDto(business);
    }

    public async Task<OwnerBusinessProfileDto> UpdateProfileAsync(
        long userId,
        long businessId,
        UpdateBusinessProfileRequest request,
        CancellationToken cancellationToken = default)
    {
        var business = await GetOwnedBusinessAsync(
            userId,
            businessId,
            cancellationToken);

        business.UpdateDetails(
            business.Name,
            business.Slug,
            NullIfEmpty(request.Description));

        business.UpdateContact(
            request.PhoneNumber.Trim(),
            NullIfEmpty(request.WhatsAppNumber),
            NullIfEmpty(request.Email),
            NormalizeWebsiteUrl(request.WebsiteUrl));

        business.UpdateLocation(
            business.CityId,
            business.DistrictId,
            NullIfEmpty(request.Address),
            business.Latitude,
            business.Longitude);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return ToProfileDto(business);
    }

    public async Task<IReadOnlyList<OwnerCampaignDto>> ListCampaignsAsync(
        long userId,
        long businessId,
        CancellationToken cancellationToken = default)
    {
        await EnsureOwnerAsync(userId, businessId, cancellationToken);

        var campaigns = await _dbContext.BusinessCampaigns
            .AsNoTracking()
            .Where(x => x.BusinessId == businessId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return campaigns.Select(ToCampaignDto).ToList();
    }

    public async Task<OwnerCampaignDto> CreateCampaignAsync(
        long userId,
        long businessId,
        SaveCampaignRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureOwnerAsync(userId, businessId, cancellationToken);

        var campaignCount = await _dbContext.BusinessCampaigns
            .CountAsync(x => x.BusinessId == businessId, cancellationToken);

        if (campaignCount >= MaxCampaignsPerBusiness)
        {
            throw new RequestValidationException(
                $"En fazla {MaxCampaignsPerBusiness} kampanya ekleyebilirsin. Eskileri silerek yer açabilirsin.");
        }

        var input = await ValidateCampaignAsync(
            businessId,
            null,
            request,
            cancellationToken);

        var campaign = new BusinessCampaign(
            businessId,
            input.Title,
            input.Code,
            input.Description);

        campaign.Update(
            input.Title,
            input.Code,
            input.Description,
            input.StartsAtUtc,
            input.EndsAtUtc);

        _dbContext.BusinessCampaigns.Add(campaign);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return ToCampaignDto(campaign);
    }

    public async Task<OwnerCampaignDto> UpdateCampaignAsync(
        long userId,
        long businessId,
        long campaignId,
        SaveCampaignRequest request,
        CancellationToken cancellationToken = default)
    {
        var campaign = await GetOwnedCampaignAsync(
            userId,
            businessId,
            campaignId,
            cancellationToken);

        var input = await ValidateCampaignAsync(
            businessId,
            campaignId,
            request,
            cancellationToken);

        campaign.Update(
            input.Title,
            input.Code,
            input.Description,
            input.StartsAtUtc,
            input.EndsAtUtc);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return ToCampaignDto(campaign);
    }

    public async Task<OwnerCampaignDto> SetCampaignActiveAsync(
        long userId,
        long businessId,
        long campaignId,
        bool isActive,
        CancellationToken cancellationToken = default)
    {
        var campaign = await GetOwnedCampaignAsync(
            userId,
            businessId,
            campaignId,
            cancellationToken);

        if (isActive)
        {
            campaign.Activate();
        }
        else
        {
            campaign.Deactivate();
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return ToCampaignDto(campaign);
    }

    public async Task DeleteCampaignAsync(
        long userId,
        long businessId,
        long campaignId,
        CancellationToken cancellationToken = default)
    {
        var campaign = await GetOwnedCampaignAsync(
            userId,
            businessId,
            campaignId,
            cancellationToken);

        _dbContext.BusinessCampaigns.Remove(campaign);

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<OwnerImagesDto> GetImagesAsync(
        long userId,
        long businessId,
        CancellationToken cancellationToken = default)
    {
        var business = await GetOwnedBusinessAsync(
            userId,
            businessId,
            cancellationToken);

        return await ToImagesDtoAsync(business, cancellationToken);
    }

    public async Task<OwnerImagesDto> AddImageAsync(
        long userId,
        long businessId,
        ImageUpload upload,
        string? altText,
        CancellationToken cancellationToken = default)
    {
        var business = await GetOwnedBusinessAsync(
            userId,
            businessId,
            cancellationToken);

        var images = await _dbContext.BusinessImages
            .Where(x => x.BusinessId == businessId)
            .ToListAsync(cancellationToken);

        if (images.Count >= MaxImagesPerBusiness)
        {
            throw new RequestValidationException(
                $"Galeride en fazla {MaxImagesPerBusiness} görsel olabilir. Yenisini eklemek için birini sil.");
        }

        var url = await SaveImageFileAsync(upload, businessId, cancellationToken);

        var image = new BusinessImage(
            businessId,
            url,
            NullIfEmpty(altText) ?? business.Name,
            images.Count == 0 ? 1 : images.Max(x => x.SortOrder) + 1,
            // İlk yüklenen görsel otomatik olarak kapak olur.
            isCover: !images.Any(x => x.IsCover));

        _dbContext.BusinessImages.Add(image);

        await SaveOrDeleteFileAsync(url, cancellationToken);

        return await ToImagesDtoAsync(business, cancellationToken);
    }

    public async Task<OwnerImagesDto> SetCoverImageAsync(
        long userId,
        long businessId,
        long imageId,
        CancellationToken cancellationToken = default)
    {
        var business = await GetOwnedBusinessAsync(
            userId,
            businessId,
            cancellationToken);

        var images = await _dbContext.BusinessImages
            .Where(x => x.BusinessId == businessId)
            .ToListAsync(cancellationToken);

        var cover = images.FirstOrDefault(x => x.Id == imageId)
            ?? throw new KeyNotFoundException("Image not found.");

        foreach (var image in images.Where(x => x.IsCover && x.Id != imageId))
        {
            image.RemoveAsCover();
        }

        cover.SetAsCover();

        await _dbContext.SaveChangesAsync(cancellationToken);

        return await ToImagesDtoAsync(business, cancellationToken);
    }

    public async Task<OwnerImagesDto> ReorderImagesAsync(
        long userId,
        long businessId,
        ReorderImagesRequest request,
        CancellationToken cancellationToken = default)
    {
        var business = await GetOwnedBusinessAsync(
            userId,
            businessId,
            cancellationToken);

        var images = await _dbContext.BusinessImages
            .Where(x => x.BusinessId == businessId)
            .ToListAsync(cancellationToken);

        var requestedIds = request.ImageIds.Distinct().ToList();

        if (requestedIds.Count != images.Count ||
            !images.All(x => requestedIds.Contains(x.Id)))
        {
            throw new RequestValidationException(
                "Görsel listesi güncel değil. Sayfayı yenileyip tekrar dene.");
        }

        for (var index = 0; index < requestedIds.Count; index++)
        {
            var image = images.First(x => x.Id == requestedIds[index]);

            image.Update(image.Url, image.AltText, index + 1);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return await ToImagesDtoAsync(business, cancellationToken);
    }

    public async Task<OwnerImagesDto> DeleteImageAsync(
        long userId,
        long businessId,
        long imageId,
        CancellationToken cancellationToken = default)
    {
        var business = await GetOwnedBusinessAsync(
            userId,
            businessId,
            cancellationToken);

        var images = await _dbContext.BusinessImages
            .Where(x => x.BusinessId == businessId)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(cancellationToken);

        var image = images.FirstOrDefault(x => x.Id == imageId)
            ?? throw new KeyNotFoundException("Image not found.");

        _dbContext.BusinessImages.Remove(image);

        // Kapak silinirse sıradaki ilk görsel kapak olur.
        if (image.IsCover)
        {
            images.FirstOrDefault(x => x.Id != imageId)?.SetAsCover();
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        await _fileStorage.DeleteAsync(image.Url, cancellationToken);

        return await ToImagesDtoAsync(business, cancellationToken);
    }

    public async Task<OwnerImagesDto> SetLogoAsync(
        long userId,
        long businessId,
        ImageUpload upload,
        CancellationToken cancellationToken = default)
    {
        var business = await GetOwnedBusinessAsync(
            userId,
            businessId,
            cancellationToken);

        var previousLogoUrl = business.LogoUrl;
        var url = await SaveImageFileAsync(upload, businessId, cancellationToken);

        business.UpdateLogo(url);

        await SaveOrDeleteFileAsync(url, cancellationToken);

        if (previousLogoUrl is not null)
        {
            await _fileStorage.DeleteAsync(previousLogoUrl, cancellationToken);
        }

        return await ToImagesDtoAsync(business, cancellationToken);
    }

    public async Task<OwnerImagesDto> DeleteLogoAsync(
        long userId,
        long businessId,
        CancellationToken cancellationToken = default)
    {
        var business = await GetOwnedBusinessAsync(
            userId,
            businessId,
            cancellationToken);

        var previousLogoUrl = business.LogoUrl;

        business.UpdateLogo(null);

        await _dbContext.SaveChangesAsync(cancellationToken);

        if (previousLogoUrl is not null)
        {
            await _fileStorage.DeleteAsync(previousLogoUrl, cancellationToken);
        }

        return await ToImagesDtoAsync(business, cancellationToken);
    }

    private async Task<string> SaveImageFileAsync(
        ImageUpload upload,
        long businessId,
        CancellationToken cancellationToken)
    {
        var (content, extension) = await ImageFileValidator.ReadAsync(
            upload,
            cancellationToken);

        await using (content)
        {
            return await _fileStorage.SaveAsync(
                content,
                $"businesses/{businessId}",
                extension,
                cancellationToken);
        }
    }

    // Veritabanı kaydı başarısız olursa diske yazılan dosya sahipsiz kalmasın.
    private async Task SaveOrDeleteFileAsync(
        string url,
        CancellationToken cancellationToken)
    {
        try
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            await _fileStorage.DeleteAsync(url, CancellationToken.None);
            throw;
        }
    }

    private async Task<OwnerImagesDto> ToImagesDtoAsync(
        Business business,
        CancellationToken cancellationToken)
    {
        var images = await _dbContext.BusinessImages
            .AsNoTracking()
            .Where(x => x.BusinessId == business.Id)
            .OrderBy(x => x.SortOrder)
            .Select(x => new OwnerImageDto(
                x.Id,
                x.Url,
                x.AltText,
                x.SortOrder,
                x.IsCover))
            .ToListAsync(cancellationToken);

        return new OwnerImagesDto(business.LogoUrl, images, MaxImagesPerBusiness);
    }

    private async Task<CampaignInput> ValidateCampaignAsync(
        long businessId,
        long? campaignId,
        SaveCampaignRequest request,
        CancellationToken cancellationToken)
    {
        if (request.StartsOn.HasValue &&
            request.EndsOn.HasValue &&
            request.EndsOn < request.StartsOn)
        {
            throw new RequestValidationException(
                "Bitiş tarihi başlangıç tarihinden önce olamaz.");
        }

        var code = request.Code.Trim().ToUpperInvariant();

        var codeTaken = await _dbContext.BusinessCampaigns
            .AnyAsync(
                x => x.BusinessId == businessId &&
                     x.Code == code &&
                     x.Id != campaignId,
                cancellationToken);

        if (codeTaken)
        {
            throw new RequestValidationException(
                "Bu kod başka bir kampanyanda kullanılıyor.");
        }

        return new CampaignInput(
            request.Title.Trim(),
            code,
            request.Description.Trim(),
            request.StartsOn.HasValue
                ? TurkeyDayStartUtc(request.StartsOn.Value)
                : null,
            // Bitiş günü dahil: ertesi günün başlangıcından 1 saniye öncesi.
            request.EndsOn.HasValue
                ? TurkeyDayStartUtc(request.EndsOn.Value.AddDays(1)).AddSeconds(-1)
                : null);
    }

    private async Task<Business> GetOwnedBusinessAsync(
        long userId,
        long businessId,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Businesses
            .FirstOrDefaultAsync(
                x => x.Id == businessId && x.OwnerUserId == userId,
                cancellationToken)
            ?? throw new KeyNotFoundException("Business not found.");
    }

    private async Task<BusinessCampaign> GetOwnedCampaignAsync(
        long userId,
        long businessId,
        long campaignId,
        CancellationToken cancellationToken)
    {
        await EnsureOwnerAsync(userId, businessId, cancellationToken);

        return await _dbContext.BusinessCampaigns
            .FirstOrDefaultAsync(
                x => x.Id == campaignId && x.BusinessId == businessId,
                cancellationToken)
            ?? throw new KeyNotFoundException("Campaign not found.");
    }

    private static OwnerBusinessProfileDto ToProfileDto(Business business)
    {
        return new OwnerBusinessProfileDto(
            business.Name,
            business.Description,
            business.PhoneNumber,
            business.WhatsAppNumber,
            business.Email,
            business.WebsiteUrl,
            business.Address);
    }

    private static OwnerCampaignDto ToCampaignDto(BusinessCampaign campaign)
    {
        var now = DateTime.UtcNow;

        var visibility =
            !campaign.IsActive ? CampaignVisibility.Disabled
            : campaign.StartsAtUtc > now ? CampaignVisibility.Scheduled
            : campaign.EndsAtUtc < now ? CampaignVisibility.Expired
            : CampaignVisibility.Live;

        return new OwnerCampaignDto(
            campaign.Id,
            campaign.Title,
            campaign.Code,
            campaign.Description,
            campaign.StartsAtUtc.HasValue
                ? ToTurkeyDate(campaign.StartsAtUtc.Value)
                : null,
            campaign.EndsAtUtc.HasValue
                ? ToTurkeyDate(campaign.EndsAtUtc.Value)
                : null,
            campaign.IsActive,
            visibility);
    }

    // Profilde link olarak gösterildiği için sadece http/https kabul edilir;
    // "javascript:" gibi adresler ziyaretçinin tarayıcısında kod çalıştırabilir.
    private static string? NormalizeWebsiteUrl(string? value)
    {
        var trimmed = NullIfEmpty(value);

        if (trimmed is null)
        {
            return null;
        }

        if (!trimmed.Contains("://", StringComparison.Ordinal))
        {
            trimmed = $"https://{trimmed}";
        }

        if (!Uri.TryCreate(trimmed, UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps) ||
            !uri.Host.Contains('.'))
        {
            throw new RequestValidationException(
                "Geçerli bir web sitesi adresi girin (örn. https://ornek.com).");
        }

        return uri.ToString();
    }

    private static string? NullIfEmpty(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static DateTime TurkeyDayStartUtc(DateOnly date)
    {
        return date
            .ToDateTime(TimeOnly.MinValue)
            .AddHours(-TurkeyUtcOffsetHours);
    }

    private static DateOnly ToTurkeyDate(DateTime utc)
    {
        return DateOnly.FromDateTime(utc.AddHours(TurkeyUtcOffsetHours));
    }

    private async Task EnsureOwnerAsync(
        long userId,
        long businessId,
        CancellationToken cancellationToken)
    {
        var isOwner = await _dbContext.Businesses
            .AsNoTracking()
            .AnyAsync(
                x => x.Id == businessId && x.OwnerUserId == userId,
                cancellationToken);

        if (!isOwner)
        {
            throw new KeyNotFoundException("Business not found.");
        }
    }

    private sealed record CampaignInput(
        string Title,
        string Code,
        string Description,
        DateTime? StartsAtUtc,
        DateTime? EndsAtUtc);

    private sealed record InteractionCountRow(
        DateTime Day,
        BusinessInteractionType Type,
        int Count);
}
