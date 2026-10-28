namespace Plandayim.Application.Accounts;

public sealed record AccountDto(
    long Id,
    string FullName,
    string Email,
    IReadOnlyList<OwnedBusinessDto> Businesses);

public sealed record OwnedBusinessDto(
    long Id,
    string Name,
    string Slug);
