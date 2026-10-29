namespace Plandayim.Application.OwnerBusinesses;

public sealed record OwnerImageDto(
    long Id,
    string Url,
    string? AltText,
    int SortOrder,
    bool IsCover);

public sealed record OwnerImagesDto(
    string? LogoUrl,
    IReadOnlyList<OwnerImageDto> Images,
    int MaxImages);

public sealed record ImageUpload(
    Stream Content,
    long Length);

public sealed class ReorderImagesRequest
{
    public IReadOnlyList<long> ImageIds { get; init; } = [];
}
