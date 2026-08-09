namespace Plandayim.Application.Businesses;

public sealed class BusinessSearchRequest
{
    public long? CategoryId { get; init; }

    public long? CityId { get; init; }

    public long? DistrictId { get; init; }
}