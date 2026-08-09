namespace Plandayim.Application.Locations;

public interface ILocationService
{
    Task<IReadOnlyList<CityDto>> GetCitiesAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<DistrictDto>> GetDistrictsByCityAsync(
        long cityId,
        CancellationToken cancellationToken = default);
}