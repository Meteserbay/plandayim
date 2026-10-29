using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Plandayim.Api.Auth;
using Plandayim.Application.AdminBusinesses;

namespace Plandayim.Api.Controllers;

[ApiController]
[Authorize(Policy = AuthPolicies.Admin)]
[Route("api/admin/businesses")]
public sealed class AdminBusinessesController : ControllerBase
{
    private readonly IAdminBusinessService _service;

    public AdminBusinessesController(IAdminBusinessService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<AdminBusinessListDto>> List(
        [FromQuery] string? q,
        [FromQuery] int page = 1,
        CancellationToken cancellationToken = default)
    {
        return Ok(await _service.ListAsync(q, page, cancellationToken));
    }

    [HttpGet("{businessId:long}")]
    public async Task<ActionResult<AdminBusinessDetailDto>> Get(
        long businessId,
        CancellationToken cancellationToken)
    {
        return Ok(await _service.GetAsync(businessId, cancellationToken));
    }

    [HttpPut("{businessId:long}")]
    public async Task<ActionResult<AdminBusinessDetailDto>> Update(
        long businessId,
        [FromBody] UpdateAdminBusinessRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await _service.UpdateAsync(
            businessId,
            request,
            cancellationToken));
    }

    [HttpPost("{businessId:long}/activate")]
    public async Task<ActionResult<AdminBusinessDetailDto>> Activate(
        long businessId,
        CancellationToken cancellationToken)
    {
        return Ok(await _service.SetActiveAsync(businessId, true, cancellationToken));
    }

    [HttpPost("{businessId:long}/deactivate")]
    public async Task<ActionResult<AdminBusinessDetailDto>> Deactivate(
        long businessId,
        CancellationToken cancellationToken)
    {
        return Ok(await _service.SetActiveAsync(businessId, false, cancellationToken));
    }

    [HttpPost("{businessId:long}/verify")]
    public async Task<ActionResult<AdminBusinessDetailDto>> Verify(
        long businessId,
        CancellationToken cancellationToken)
    {
        return Ok(await _service.SetVerifiedAsync(businessId, true, cancellationToken));
    }

    [HttpPost("{businessId:long}/unverify")]
    public async Task<ActionResult<AdminBusinessDetailDto>> Unverify(
        long businessId,
        CancellationToken cancellationToken)
    {
        return Ok(await _service.SetVerifiedAsync(businessId, false, cancellationToken));
    }

    [HttpDelete("{businessId:long}/owner")]
    public async Task<ActionResult<AdminBusinessDetailDto>> RemoveOwner(
        long businessId,
        CancellationToken cancellationToken)
    {
        return Ok(await _service.RemoveOwnerAsync(businessId, cancellationToken));
    }
}
