namespace Plandayim.Application.AdminBusinesses;

public interface IAdminBusinessService
{
    /// <summary>Yayında olmayanlar dahil tüm firmaları ada göre arar.</summary>
    Task<AdminBusinessListDto> ListAsync(
        string? query,
        int page,
        CancellationToken cancellationToken = default);

    Task<AdminBusinessDetailDto> GetAsync(
        long businessId,
        CancellationToken cancellationToken = default);

    Task<AdminBusinessDetailDto> UpdateAsync(
        long businessId,
        UpdateAdminBusinessRequest request,
        CancellationToken cancellationToken = default);

    Task<AdminBusinessDetailDto> SetActiveAsync(
        long businessId,
        bool isActive,
        CancellationToken cancellationToken = default);

    Task<AdminBusinessDetailDto> SetVerifiedAsync(
        long businessId,
        bool isVerified,
        CancellationToken cancellationToken = default);

    Task<AdminBusinessDetailDto> RemoveOwnerAsync(
        long businessId,
        CancellationToken cancellationToken = default);
}
