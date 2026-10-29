using Microsoft.EntityFrameworkCore;
using Plandayim.Application.AdminBusinesses;
using Plandayim.Application.Common;
using Plandayim.Domain.Businesses;
using Plandayim.Infrastructure.Businesses;
using Plandayim.Infrastructure.Common;
using Plandayim.Infrastructure.Persistence;

namespace Plandayim.Infrastructure.AdminBusinesses;

public sealed class AdminBusinessService : IAdminBusinessService
{
    private const int PageSize = 25;

    private readonly PlandayimDbContext _dbContext;

    public AdminBusinessService(PlandayimDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<AdminBusinessListDto> ListAsync(
        string? query,
        int page,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);

        var businesses = _dbContext.Businesses.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(query))
        {
            var term = query.Trim();

            businesses = businesses.Where(x =>
                x.Name.Contains(term) || x.Slug.Contains(term));
        }

        var totalCount = await businesses.CountAsync(cancellationToken);

        // Sıralama ve sayfalama projeksiyondan önce yapılır.
        var items = await businesses
            .OrderByDescending(x => x.CreatedAtUtc)
            .Skip((page - 1) * PageSize)
            .Take(PageSize)
            .Select(x => new AdminBusinessListItemDto(
                x.Id,
                x.Name,
                x.Slug,
                _dbContext.Cities
                    .Where(city => city.Id == x.CityId)
                    .Select(city => city.Name)
                    .First(),
                _dbContext.Districts
                    .Where(district => district.Id == x.DistrictId)
                    .Select(district => district.Name)
                    .First(),
                (
                    from businessCategory in _dbContext.BusinessCategories
                    join category in _dbContext.Categories
                        on businessCategory.CategoryId equals category.Id
                    where businessCategory.BusinessId == x.Id &&
                          businessCategory.IsPrimary
                    select category.Name
                ).FirstOrDefault(),
                x.IsActive,
                x.IsVerified,
                _dbContext.Users
                    .Where(user => user.Id == x.OwnerUserId)
                    .Select(user => user.Email)
                    .FirstOrDefault(),
                x.CreatedAtUtc))
            .ToListAsync(cancellationToken);

        return new AdminBusinessListDto(items, totalCount, page, PageSize);
    }

    public async Task<AdminBusinessDetailDto> GetAsync(
        long businessId,
        CancellationToken cancellationToken = default)
    {
        var business = await _dbContext.Businesses
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == businessId, cancellationToken)
            ?? throw new KeyNotFoundException("Business not found.");

        var categories = await _dbContext.BusinessCategories
            .AsNoTracking()
            .Where(x => x.BusinessId == businessId)
            .ToListAsync(cancellationToken);

        var serviceAreaIds = await _dbContext.BusinessServiceAreas
            .AsNoTracking()
            .Where(x => x.BusinessId == businessId)
            .Select(x => x.DistrictId)
            .ToListAsync(cancellationToken);

        var owner = business.OwnerUserId.HasValue
            ? await _dbContext.Users
                .AsNoTracking()
                .Where(x => x.Id == business.OwnerUserId)
                .Select(x => new { x.Email, x.FullName })
                .FirstOrDefaultAsync(cancellationToken)
            : null;

        return new AdminBusinessDetailDto(
            business.Id,
            business.Name,
            business.Slug,
            business.Description,
            business.PhoneNumber,
            business.WhatsAppNumber,
            business.Email,
            business.WebsiteUrl,
            business.Address,
            business.CityId,
            business.DistrictId,
            categories.Select(x => x.CategoryId).ToList(),
            categories.FirstOrDefault(x => x.IsPrimary)?.CategoryId,
            serviceAreaIds,
            business.IsActive,
            business.IsVerified,
            business.OwnerUserId,
            owner?.Email,
            owner?.FullName);
    }

    public async Task<AdminBusinessDetailDto> UpdateAsync(
        long businessId,
        UpdateAdminBusinessRequest request,
        CancellationToken cancellationToken = default)
    {
        var business = await GetTrackedAsync(businessId, cancellationToken);

        var slug = request.Slug.Trim();

        var slugTaken = await _dbContext.Businesses
            .AnyAsync(
                x => x.Slug == slug && x.Id != businessId,
                cancellationToken);

        if (slugTaken)
        {
            throw new RequestValidationException(
                "Bu profil adresi başka bir firma tarafından kullanılıyor.");
        }

        var classification = await BusinessClassification.ValidateAsync(
            _dbContext,
            request.CityId,
            request.DistrictId,
            request.CategoryIds,
            request.PrimaryCategoryId,
            request.ServiceAreaDistrictIds,
            cancellationToken);

        await using var transaction =
            await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        business.UpdateDetails(
            request.Name.Trim(),
            slug,
            NullIfEmpty(request.Description));

        business.UpdateContact(
            request.PhoneNumber.Trim(),
            NullIfEmpty(request.WhatsAppNumber),
            NullIfEmpty(request.Email),
            WebsiteUrl.Normalize(request.WebsiteUrl));

        business.UpdateLocation(
            classification.CityId,
            classification.DistrictId,
            NullIfEmpty(request.Address),
            business.Latitude,
            business.Longitude);

        await classification.ApplyToAsync(
            _dbContext,
            businessId,
            cancellationToken);

        await _dbContext.SaveChangesAsync(cancellationToken);

        await transaction.CommitAsync(cancellationToken);

        return await GetAsync(businessId, cancellationToken);
    }

    public async Task<AdminBusinessDetailDto> SetActiveAsync(
        long businessId,
        bool isActive,
        CancellationToken cancellationToken = default)
    {
        var business = await GetTrackedAsync(businessId, cancellationToken);

        if (isActive)
        {
            business.Activate();
        }
        else
        {
            business.Deactivate();
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return await GetAsync(businessId, cancellationToken);
    }

    public async Task<AdminBusinessDetailDto> SetVerifiedAsync(
        long businessId,
        bool isVerified,
        CancellationToken cancellationToken = default)
    {
        var business = await GetTrackedAsync(businessId, cancellationToken);

        if (isVerified)
        {
            business.Verify();
        }
        else
        {
            business.Unverify();
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return await GetAsync(businessId, cancellationToken);
    }

    public async Task<AdminBusinessDetailDto> RemoveOwnerAsync(
        long businessId,
        CancellationToken cancellationToken = default)
    {
        var business = await GetTrackedAsync(businessId, cancellationToken);

        business.RemoveOwner();

        await _dbContext.SaveChangesAsync(cancellationToken);

        return await GetAsync(businessId, cancellationToken);
    }

    private async Task<Business> GetTrackedAsync(
        long businessId,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Businesses
            .FirstOrDefaultAsync(x => x.Id == businessId, cancellationToken)
            ?? throw new KeyNotFoundException("Business not found.");
    }

    private static string? NullIfEmpty(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
