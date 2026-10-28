using Microsoft.AspNetCore.Mvc;
using Plandayim.Api.Auth;
using Plandayim.Application.Businesses;

namespace Plandayim.Api.Controllers;

[ApiController]
[Route("api/businesses")]
public sealed class BusinessesController : ControllerBase
{
    private readonly IBusinessService _businessService;

    public BusinessesController(IBusinessService businessService)
    {
        _businessService = businessService;
    }


    [HttpPost("{businessId:long}/interactions")]
    public async Task<IActionResult> RecordInteraction(
    long businessId,
    [FromBody] CreateBusinessInteractionRequest request,
    CancellationToken cancellationToken)
    {
        // Varsayılan şema firma sahibi çerezidir; giriş yoksa kimlik boş kalır.
        long? viewerUserId = User.Identity?.IsAuthenticated == true
            ? User.GetUserId()
            : null;

        await _businessService.RecordInteractionAsync(
            businessId,
            request.Type,
            viewerUserId,
            cancellationToken);

        return NoContent();
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<BusinessListItemDto>>> Search(
        [FromQuery] BusinessSearchRequest request,
        CancellationToken cancellationToken)
    {
        var businesses =
            await _businessService.SearchAsync(request, cancellationToken);

        return Ok(businesses);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<BusinessDetailDto>> GetBySlug(
        string slug,
        CancellationToken cancellationToken)
    {
        var business =
            await _businessService.GetBySlugAsync(
                slug,
                cancellationToken);

        if (business is null)
        {
            return NotFound();
        }

        return Ok(business);
    }
}