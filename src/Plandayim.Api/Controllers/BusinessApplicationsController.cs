using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Plandayim.Api.Auth;
using Plandayim.Application.BusinessApplications;

namespace Plandayim.Api.Controllers;

[ApiController]
[Route("api/business-applications")]
public sealed class BusinessApplicationsController : ControllerBase
{
    private readonly IBusinessApplicationService _service;

    public BusinessApplicationsController(
        IBusinessApplicationService service)
    {
        _service = service;
    }

    // Başvuru hesaba bağlanır; onaylanınca firma bu hesabın paneline düşer.
    [Authorize(Policy = AuthPolicies.Owner)]
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateBusinessApplicationRequest request,
        CancellationToken cancellationToken)
    {
        var applicationId = await _service.CreateAsync(
            request,
            User.GetUserId(),
            cancellationToken);

        return Created(
            $"/api/business-applications/{applicationId}",
            new { id = applicationId });
    }
}
