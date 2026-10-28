using Plandayim.Domain.Businesses;

namespace Plandayim.Application.Businesses;

public interface IBusinessService
{
    Task<IReadOnlyList<BusinessListItemDto>> SearchAsync(
        BusinessSearchRequest request,
        CancellationToken cancellationToken = default);

    Task<BusinessDetailDto?> GetBySlugAsync(
        string slug,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Etkileşimi kaydeder. Ziyaretçi işletmenin sahibiyse kaydetmez;
    /// sahibin kendi profiline bakması istatistikleri şişirmemeli.
    /// </summary>
    Task RecordInteractionAsync(
    long businessId,
    BusinessInteractionType type,
    long? viewerUserId,
    CancellationToken cancellationToken = default);
}