namespace Plandayim.Application.Businesses;

public sealed record BusinessImageDto(
    string Url,
    string? AltText,
    int SortOrder,
    bool IsCover);