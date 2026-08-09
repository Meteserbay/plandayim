namespace Plandayim.Application.Businesses;

public sealed record BusinessListItemDto(
    long Id,
    string Name,
    string Slug,
    string PhoneNumber,
    string? WhatsAppNumber,
    string? Address,
    long CityId,
    long DistrictId,
    bool IsVerified);