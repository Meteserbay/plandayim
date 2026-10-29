using Microsoft.EntityFrameworkCore;
using Plandayim.Application.BusinessApplications;
using Plandayim.Application.Common;
using Plandayim.Domain.BusinessApplications;
using Plandayim.Domain.Businesses;
using Plandayim.Infrastructure.Common;
using Plandayim.Infrastructure.Persistence;

namespace Plandayim.Infrastructure.BusinessApplications;

public sealed class BusinessApplicationService
    : IBusinessApplicationService
{
    private const int MaxListCount = 200;

    private readonly PlandayimDbContext _dbContext;

    public BusinessApplicationService(PlandayimDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<long> CreateAsync(
        CreateBusinessApplicationRequest request,
        long applicantUserId,
        CancellationToken cancellationToken = default)
    {
        if (request.Type == BusinessApplicationType.ClaimBusiness)
        {
            if (!request.BusinessId.HasValue)
            {
                throw new ArgumentException(
                    "Claim business applications require a BusinessId.");
            }

            var business = await _dbContext.Businesses
                .AsNoTracking()
                .Where(x => x.Id == request.BusinessId && x.IsActive)
                .Select(x => new { x.OwnerUserId })
                .FirstOrDefaultAsync(cancellationToken)
                ?? throw new KeyNotFoundException("Business not found.");

            if (business.OwnerUserId == applicantUserId)
            {
                throw new RequestValidationException(
                    "Bu işletme zaten senin hesabına bağlı.");
            }

            if (business.OwnerUserId.HasValue)
            {
                throw new RequestValidationException(
                    "Bu işletmenin zaten doğrulanmış bir sahibi var. Bir hata olduğunu düşünüyorsan bizimle iletişime geç.");
            }
        }

        var hasPendingDuplicate = await _dbContext.BusinessApplications
            .AsNoTracking()
            .AnyAsync(
                x => x.ApplicantUserId == applicantUserId &&
                     x.Status == BusinessApplicationStatus.Pending &&
                     x.Type == request.Type &&
                     (request.Type == BusinessApplicationType.ClaimBusiness
                         ? x.BusinessId == request.BusinessId
                         : x.BusinessName == request.BusinessName.Trim()),
                cancellationToken);

        if (hasPendingDuplicate)
        {
            throw new RequestValidationException(
                "Bu işletme için zaten bekleyen bir başvurun var.");
        }

        var businessId = request.Type == BusinessApplicationType.ClaimBusiness
            ? request.BusinessId
            : null;

        var application = new BusinessApplication(
            request.BusinessName.Trim(),
            request.ContactName.Trim(),
            request.PhoneNumber.Trim(),
            request.Email.Trim(),
            request.Type,
            businessId,
            string.IsNullOrWhiteSpace(request.Message)
                ? null
                : request.Message.Trim(),
            applicantUserId);

        _dbContext.BusinessApplications.Add(application);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return application.Id;
    }

    public async Task<IReadOnlyList<BusinessApplicationDto>> ListForApplicantAsync(
        long applicantUserId,
        CancellationToken cancellationToken = default)
    {
        var applications = _dbContext.BusinessApplications
            .AsNoTracking()
            .Where(x => x.ApplicantUserId == applicantUserId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Take(MaxListCount);

        return await ProjectToDto(applications)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BusinessApplicationDto>> ListAsync(
        BusinessApplicationStatus? status,
        CancellationToken cancellationToken = default)
    {
        var applications = _dbContext.BusinessApplications.AsNoTracking();

        if (status.HasValue)
        {
            applications = applications.Where(x => x.Status == status.Value);
        }

        applications = applications
            .OrderByDescending(x => x.CreatedAtUtc)
            .Take(MaxListCount);

        return await ProjectToDto(applications)
            .ToListAsync(cancellationToken);
    }

    public async Task<BusinessApplicationDto> ApproveAsync(
        long applicationId,
        ApproveBusinessApplicationRequest request,
        CancellationToken cancellationToken = default)
    {
        var application = await GetPendingAsync(
            applicationId,
            cancellationToken);

        if (application.Type == BusinessApplicationType.ClaimBusiness)
        {
            var claimedBusiness = await _dbContext.Businesses
                .FirstOrDefaultAsync(
                    x => x.Id == application.BusinessId,
                    cancellationToken)
                ?? throw new KeyNotFoundException("Business not found.");

            if (application.ApplicantUserId.HasValue)
            {
                if (claimedBusiness.OwnerUserId.HasValue &&
                    claimedBusiness.OwnerUserId != application.ApplicantUserId)
                {
                    throw new RequestValidationException(
                        "Bu işletmenin zaten başka bir sahibi var. Önce o sahipliği kaldırmak gerekir.");
                }

                claimedBusiness.AssignOwner(application.ApplicantUserId.Value);
            }

            application.Approve();

            await _dbContext.SaveChangesAsync(cancellationToken);

            return await GetDtoAsync(applicationId, cancellationToken);
        }

        var input = await ValidateNewBusinessAsync(
            request,
            cancellationToken);

        var slug = await GenerateUniqueSlugAsync(
            application.BusinessName,
            cancellationToken);

        await using var transaction =
            await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        // Başvurudaki telefon firma profilinde gösterilir; kişisel e-posta
        // ise profilde yayınlanmaz, admin isterse sonradan ekler.
        var business = new Business(
            application.BusinessName,
            slug,
            application.PhoneNumber,
            input.CityId,
            input.DistrictId);

        if (application.ApplicantUserId.HasValue)
        {
            business.AssignOwner(application.ApplicantUserId.Value);
        }

        business.UpdateDetails(
            application.BusinessName,
            slug,
            NullIfEmpty(request.Description));

        business.UpdateLocation(
            input.CityId,
            input.DistrictId,
            NullIfEmpty(request.Address),
            null,
            null);

        _dbContext.Businesses.Add(business);

        await _dbContext.SaveChangesAsync(cancellationToken);

        _dbContext.BusinessCategories.AddRange(
            input.CategoryIds.Select(categoryId => new BusinessCategory(
                business.Id,
                categoryId,
                categoryId == input.PrimaryCategoryId)));

        _dbContext.BusinessServiceAreas.AddRange(
            input.ServiceAreaDistrictIds.Select(districtId =>
                new BusinessServiceArea(business.Id, districtId)));

        application.Approve(business.Id);

        await _dbContext.SaveChangesAsync(cancellationToken);

        await transaction.CommitAsync(cancellationToken);

        return await GetDtoAsync(applicationId, cancellationToken);
    }

    public async Task<BusinessApplicationDto> RejectAsync(
        long applicationId,
        CancellationToken cancellationToken = default)
    {
        var application = await GetPendingAsync(
            applicationId,
            cancellationToken);

        application.Reject();

        await _dbContext.SaveChangesAsync(cancellationToken);

        return await GetDtoAsync(applicationId, cancellationToken);
    }

    private async Task<BusinessApplication> GetPendingAsync(
        long applicationId,
        CancellationToken cancellationToken)
    {
        var application = await _dbContext.BusinessApplications
            .FirstOrDefaultAsync(x => x.Id == applicationId, cancellationToken)
            ?? throw new KeyNotFoundException("Business application not found.");

        if (application.Status != BusinessApplicationStatus.Pending)
        {
            throw new RequestValidationException(
                "Bu başvuru zaten sonuçlandırılmış.");
        }

        return application;
    }

    private async Task<NewBusinessInput> ValidateNewBusinessAsync(
        ApproveBusinessApplicationRequest request,
        CancellationToken cancellationToken)
    {
        if (!request.CityId.HasValue)
        {
            throw new RequestValidationException("Şehir seçmelisin.");
        }

        if (!request.DistrictId.HasValue)
        {
            throw new RequestValidationException("İlçe seçmelisin.");
        }

        var cityId = request.CityId.Value;
        var districtId = request.DistrictId.Value;

        var districtBelongsToCity = await _dbContext.Districts
            .AsNoTracking()
            .AnyAsync(
                x => x.Id == districtId && x.CityId == cityId,
                cancellationToken);

        if (!districtBelongsToCity)
        {
            throw new RequestValidationException(
                "Seçilen ilçe bu şehre ait değil.");
        }

        var categoryIds = request.CategoryIds.Distinct().ToList();

        if (categoryIds.Count == 0)
        {
            throw new RequestValidationException(
                "En az bir kategori seçmelisin.");
        }

        var existingCategoryCount = await _dbContext.Categories
            .AsNoTracking()
            .CountAsync(x => categoryIds.Contains(x.Id), cancellationToken);

        if (existingCategoryCount != categoryIds.Count)
        {
            throw new RequestValidationException(
                "Seçilen kategorilerden biri bulunamadı.");
        }

        var primaryCategoryId = request.PrimaryCategoryId ?? categoryIds[0];

        if (!categoryIds.Contains(primaryCategoryId))
        {
            throw new RequestValidationException(
                "Ana kategori seçilen kategorilerden biri olmalı.");
        }

        // Arama ilçeye göre hizmet bölgelerinden yapıldığı için firmanın
        // kendi ilçesi her zaman hizmet bölgesine eklenir.
        var serviceAreaDistrictIds = request.ServiceAreaDistrictIds
            .Append(districtId)
            .Distinct()
            .ToList();

        var existingDistrictCount = await _dbContext.Districts
            .AsNoTracking()
            .CountAsync(
                x => serviceAreaDistrictIds.Contains(x.Id),
                cancellationToken);

        if (existingDistrictCount != serviceAreaDistrictIds.Count)
        {
            throw new RequestValidationException(
                "Seçilen hizmet bölgelerinden biri bulunamadı.");
        }

        return new NewBusinessInput(
            cityId,
            districtId,
            categoryIds,
            primaryCategoryId,
            serviceAreaDistrictIds);
    }

    private async Task<string> GenerateUniqueSlugAsync(
        string businessName,
        CancellationToken cancellationToken)
    {
        var baseSlug = SlugGenerator.Generate(businessName);

        var existingSlugs = await _dbContext.Businesses
            .AsNoTracking()
            .Where(x => x.Slug == baseSlug || x.Slug.StartsWith(baseSlug + "-"))
            .Select(x => x.Slug)
            .ToListAsync(cancellationToken);

        if (!existingSlugs.Contains(baseSlug))
        {
            return baseSlug;
        }

        var suffix = 2;

        while (existingSlugs.Contains($"{baseSlug}-{suffix}"))
        {
            suffix++;
        }

        return $"{baseSlug}-{suffix}";
    }

    private async Task<BusinessApplicationDto> GetDtoAsync(
        long applicationId,
        CancellationToken cancellationToken)
    {
        var applications = _dbContext.BusinessApplications
            .AsNoTracking()
            .Where(x => x.Id == applicationId);

        return await ProjectToDto(applications)
            .FirstAsync(cancellationToken);
    }

    // Filtre ve sıralama bu projeksiyondan ÖNCE uygulanmalı; EF Core
    // record constructor'ı üzerinden filtrelemeyi SQL'e çeviremez.
    private IQueryable<BusinessApplicationDto> ProjectToDto(
        IQueryable<BusinessApplication> applications)
    {
        return
            from application in applications
            join business in _dbContext.Businesses.AsNoTracking()
                on application.BusinessId equals (long?)business.Id
                into businesses
            from business in businesses.DefaultIfEmpty()
            join applicant in _dbContext.Users.AsNoTracking()
                on application.ApplicantUserId equals (long?)applicant.Id
                into applicants
            from applicant in applicants.DefaultIfEmpty()
            select new BusinessApplicationDto(
                application.Id,
                application.Type,
                application.Status,
                application.BusinessId,
                business != null ? business.Slug : null,
                application.BusinessName,
                application.ContactName,
                application.PhoneNumber,
                application.Email,
                application.Message,
                application.ApplicantUserId,
                applicant != null ? applicant.Email : null,
                application.CreatedAtUtc,
                application.UpdatedAtUtc);
    }

    private static string? NullIfEmpty(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private sealed record NewBusinessInput(
        long CityId,
        long DistrictId,
        IReadOnlyList<long> CategoryIds,
        long PrimaryCategoryId,
        IReadOnlyList<long> ServiceAreaDistrictIds);
}
