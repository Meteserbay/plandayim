namespace Plandayim.Application.Locations;

public sealed record DistrictDto(
    long Id,
    string Name,
    long CityId);