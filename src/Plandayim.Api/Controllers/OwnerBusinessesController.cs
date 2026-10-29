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

    [HttpGet("profile")]
    public async Task<ActionResult<OwnerBusinessProfileDto>> GetProfile(
        long businessId,
        CancellationToken cancellationToken)
    {
        return Ok(await _service.GetProfileAsync(
            User.GetUserId(),
            businessId,
            cancellationToken));
    }

    [HttpPut("profile")]
    public async Task<ActionResult<OwnerBusinessProfileDto>> UpdateProfile(
        long businessId,
        [FromBody] UpdateBusinessProfileRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await _service.UpdateProfileAsync(
            User.GetUserId(),
            businessId,
            request,
            cancellationToken));
    }

    [HttpGet("campaigns")]
    public async Task<ActionResult<IReadOnlyList<OwnerCampaignDto>>> ListCampaigns(
        long businessId,
        CancellationToken cancellationToken)
    {
        return Ok(await _service.ListCampaignsAsync(
            User.GetUserId(),
            businessId,
            cancellationToken));
    }

    [HttpPost("campaigns")]
    public async Task<ActionResult<OwnerCampaignDto>> CreateCampaign(
        long businessId,
        [FromBody] SaveCampaignRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await _service.CreateCampaignAsync(
            User.GetUserId(),
            businessId,
            request,
            cancellationToken));
    }

    [HttpPut("campaigns/{campaignId:long}")]
    public async Task<ActionResult<OwnerCampaignDto>> UpdateCampaign(
        long businessId,
        long campaignId,
        [FromBody] SaveCampaignRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await _service.UpdateCampaignAsync(
            User.GetUserId(),
            businessId,
            campaignId,
            request,
            cancellationToken));
    }

    [HttpPost("campaigns/{campaignId:long}/activate")]
    public async Task<ActionResult<OwnerCampaignDto>> ActivateCampaign(
        long businessId,
        long campaignId,
        CancellationToken cancellationToken)
    {
        return Ok(await _service.SetCampaignActiveAsync(
            User.GetUserId(),
            businessId,
            campaignId,
            true,
            cancellationToken));
    }

    [HttpPost("campaigns/{campaignId:long}/deactivate")]
    public async Task<ActionResult<OwnerCampaignDto>> DeactivateCampaign(
        long businessId,
        long campaignId,
        CancellationToken cancellationToken)
    {
        return Ok(await _service.SetCampaignActiveAsync(
            User.GetUserId(),
            businessId,
            campaignId,
            false,
            cancellationToken));
    }

    [HttpDelete("campaigns/{campaignId:long}")]
    public async Task<IActionResult> DeleteCampaign(
        long businessId,
        long campaignId,
        CancellationToken cancellationToken)
    {
        await _service.DeleteCampaignAsync(
            User.GetUserId(),
            businessId,
            campaignId,
            cancellationToken);

        return NoContent();
    }
}
