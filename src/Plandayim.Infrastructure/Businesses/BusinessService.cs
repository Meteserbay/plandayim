using Microsoft.EntityFrameworkCore;
using Plandayim.Application.Businesses;
using Plandayim.Infrastructure.Persistence;

namespace Plandayim.Infrastructure.Businesses;

public sealed class BusinessService : IBusinessService
{
    private readonly PlandayimDbContext _dbContext;

    public BusinessService(PlandayimDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    public async Task<BusinessDetailDto?> GetBySlugAsync(
    string slug,
    CancellationToken cancellationToken = default)
    {
        var business = await (
    from b in _dbContext.Businesses.AsNoTracking()
    join city in _dbContext.Cities.AsNoTracking()
        on b.CityId equals city.Id
    join district in _dbContext.Districts.AsNoTracking()
        on b.DistrictId equals district.Id
    where b.IsActive && b.Slug == slug
    select new
    {
        b.Id,
        b.Name,
        b.Slug,
        b.Description,
        b.PhoneNumber,
        b.WhatsAppNumber,
        b.Email,
        b.WebsiteUrl,
        b.Address,
        b.CityId,
        CityName = city.Name,
        b.DistrictId,
        DistrictName = district.Name,
        b.Latitude,
        b.Longitude,
        b.IsVerified
    })
    .FirstOrDefaultAsync(cancellationToken);

        if (business is null)
        {
            return null;
        }

        var categories = await (
            from businessCategory in _dbContext.BusinessCategories.AsNoTracking()
            join category in _dbContext.Categories.AsNoTracking()
                on businessCategory.CategoryId equals category.Id
            where businessCategory.BusinessId == business.Id
            orderby businessCategory.IsPrimary descending, category.Name
            select category.Name)
            .ToListAsync(cancellationToken);

        var serviceAreas = await (
            from serviceArea in _dbContext.BusinessServiceAreas.AsNoTracking()
            join district in _dbContext.Districts.AsNoTracking()
                on serviceArea.DistrictId equals district.Id
            where serviceArea.BusinessId == business.Id
            orderby district.Name
            select district.Name)
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;

        var campaigns = await _dbContext.BusinessCampaigns
            .AsNoTracking()
            .Where(x =>
                x.BusinessId == business.Id &&
                x.IsActive &&
                (!x.StartsAtUtc.HasValue || x.StartsAtUtc <= now) &&
                (!x.EndsAtUtc.HasValue || x.EndsAtUtc >= now))
            .OrderBy(x => x.Title)
            .Select(x => new BusinessCampaignDto(
                x.Title,
                x.Code,
                x.Description,
                x.StartsAtUtc,
                x.EndsAtUtc))
            .ToListAsync(cancellationToken);

        return new BusinessDetailDto(
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
    business.CityName,
    business.DistrictId,
    business.DistrictName,
    business.Latitude,
    business.Longitude,
    business.IsVerified,
    categories,
    serviceAreas,
    campaigns);
    }
    public async Task<IReadOnlyList<BusinessListItemDto>> SearchAsync(
        BusinessSearchRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Businesses
            .AsNoTracking()
            .Where(x => x.IsActive);

        if (request.CityId.HasValue)
        {
            query = query.Where(x => x.CityId == request.CityId.Value);
        }

        if (request.CategoryId.HasValue)
        {
            query = query.Where(business =>
                _dbContext.BusinessCategories.Any(x =>
                    x.BusinessId == business.Id &&
                    x.CategoryId == request.CategoryId.Value));
        }

        if (request.DistrictId.HasValue)
        {
            query = query.Where(business =>
                _dbContext.BusinessServiceAreas.Any(x =>
                    x.BusinessId == business.Id &&
                    x.DistrictId == request.DistrictId.Value));
        }

        return await query
            .OrderByDescending(x => x.IsVerified)
            .ThenBy(x => x.Name)
            .Select(x => new BusinessListItemDto(
                x.Id,
                x.Name,
                x.Slug,
                x.PhoneNumber,
                x.WhatsAppNumber,
                x.Address,
                x.CityId,
                x.DistrictId,
                x.IsVerified))
            .ToListAsync(cancellationToken);
    }
}