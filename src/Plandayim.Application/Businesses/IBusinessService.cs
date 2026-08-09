namespace Plandayim.Application.Businesses;

public interface IBusinessService
{
    Task<IReadOnlyList<BusinessListItemDto>> SearchAsync(
        BusinessSearchRequest request,
        CancellationToken cancellationToken = default);

    Task<BusinessDetailDto?> GetBySlugAsync(
        string slug,
        CancellationToken cancellationToken = default);
}