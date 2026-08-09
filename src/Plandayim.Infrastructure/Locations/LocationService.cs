using Microsoft.EntityFrameworkCore;
using Plandayim.Application.Locations;
using Plandayim.Infrastructure.Persistence;

namespace Plandayim.Infrastructure.Locations;

public sealed class LocationService : ILocationService
{
    private readonly PlandayimDbContext _dbContext;

    public LocationService(PlandayimDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<CityDto>> GetCitiesAsync(
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Cities
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new CityDto(
                x.Id,
                x.Name))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<DistrictDto>> GetDistrictsByCityAsync(
        long cityId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Districts
            .AsNoTracking()
            .Where(x => x.CityId == cityId)
            .OrderBy(x => x.Name)
            .Select(x => new DistrictDto(
                x.Id,
                x.Name,
                x.CityId))
            .ToListAsync(cancellationToken);
    }
}