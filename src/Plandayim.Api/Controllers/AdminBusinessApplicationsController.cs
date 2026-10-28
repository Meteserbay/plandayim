using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Plandayim.Application.BusinessApplications;
using Plandayim.Domain.BusinessApplications;

namespace Plandayim.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/admin/business-applications")]
public sealed class AdminBusinessApplicationsController : ControllerBase
{
    private readonly IBusinessApplicationService _service;

    public AdminBusinessApplicationsController(
        IBusinessApplicationService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<BusinessApplicationDto>>> List(
        [FromQuery] BusinessApplicationStatus? status,
        CancellationToken cancellationToken)
    {
        return Ok(await _service.ListAsync(status, cancellationToken));
    }

    [HttpPost("{applicationId:long}/approve")]
    public async Task<ActionResult<BusinessApplicationDto>> Approve(
        long applicationId,
        [FromBody] ApproveBusinessApplicationRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await _service.ApproveAsync(
            applicationId,
            request,
            cancellationToken));
    }

    [HttpPost("{applicationId:long}/reject")]
    public async Task<ActionResult<BusinessApplicationDto>> Reject(
        long applicationId,
        CancellationToken cancellationToken)
    {
        return Ok(await _service.RejectAsync(
            applicationId,
            cancellationToken));
    }
}
