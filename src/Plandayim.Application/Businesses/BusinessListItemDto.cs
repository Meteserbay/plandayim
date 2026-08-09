namespace Plandayim.Application.Businesses;

public sealed record BusinessListItemDto(
    long Id,
    string Name,
    string Slug,
    string PhoneNumber,
    string? WhatsAppNumber,
    string? Address,
    string? LogoUrl,
    string? CoverImageUrl,
    long CityId,
    string CityName,
    long DistrictId,
    string DistrictName,
    bool IsVerified,
    string? PrimaryCategory,
    bool HasActiveCampaign);