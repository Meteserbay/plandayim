using Microsoft.AspNetCore.Mvc;
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