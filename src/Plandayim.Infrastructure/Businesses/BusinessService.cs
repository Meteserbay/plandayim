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