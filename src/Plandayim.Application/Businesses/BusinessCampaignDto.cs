namespace Plandayim.Application.Businesses;

public sealed record BusinessCampaignDto(
    string Title,
    string Code,
    string Description,
    DateTime? StartsAtUtc,
    DateTime? EndsAtUtc);