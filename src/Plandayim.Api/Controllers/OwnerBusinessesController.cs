using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Plandayim.Api.Auth;
using Plandayim.Application.OwnerBusinesses;

namespace Plandayim.Api.Controllers;

[ApiController]
[Authorize(Policy = AuthPolicies.Owner)]
[Route("api/owner/businesses/{businessId:long}")]
public sealed class OwnerBusinessesController : ControllerBase
{
    private readonly IOwnerBusinessService _service;

    public OwnerBusinessesController(IOwnerBusinessService service)
    {
        _service = service;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<BusinessStatsDto>> Stats(
        long businessId,
        [FromQuery] int days = 30,
        CancellationToken cancellationToken = default)
    {
        return Ok(await _service.GetStatsAsync(
            User.GetUserId(),
            businessId,
            days,
            cancellationToken));
    }
}
