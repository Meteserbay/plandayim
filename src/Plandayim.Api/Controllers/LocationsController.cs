using Microsoft.AspNetCore.Mvc;
using Plandayim.Application.Locations;

namespace Plandayim.Api.Controllers;

[ApiController]
[Route("api")]
public class LocationsController : ControllerBase
{
    private readonly ILocationService _locationService;

    public LocationsController(ILocationService locationService)
    {
        _locationService = locationService;
    }

    [HttpGet("cities")]
    public async Task<ActionResult<IReadOnlyList<CityDto>>> GetCities(
        CancellationToken cancellationToken)
    {
        var cities =
            await _locationService.GetCitiesAsync(cancellationToken);

        return Ok(cities);
    }

    [HttpGet("cities/{cityId:long}/districts")]
    public async Task<ActionResult<IReadOnlyList<DistrictDto>>> GetDistricts(
        long cityId,
        CancellationToken cancellationToken)
    {
        var districts =
            await _locationService.GetDistrictsByCityAsync(
                cityId,
                cancellationToken);

        return Ok(districts);
    }
}