namespace Plandayim.Application.Businesses;

public sealed record BusinessDetailDto(
    long Id,
    string Name,
    string Slug,
    string? Description,
    string PhoneNumber,
    string? WhatsAppNumber,
    string? Email,
    string? WebsiteUrl,
    string? Address,
    long CityId,
    string CityName,
    long DistrictId,
    string DistrictName,
    decimal? Latitude,
    decimal? Longitude,
    bool IsVerified,
    IReadOnlyList<string> Categories,
    IReadOnlyList<string> ServiceAreas,
    IReadOnlyList<BusinessCampaignDto> Campaigns);