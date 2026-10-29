namespace Plandayim.Application.OwnerBusinesses;

/// <summary>
/// Firma sahibinin kendi işletmeleri üzerindeki işlemleri.
/// Her metot işletmenin bu kullanıcıya ait olduğunu doğrular; değilse
/// işletmenin varlığını belli etmemek için KeyNotFoundException fırlatır.
/// </summary>
public interface IOwnerBusinessService
{
    Task<BusinessStatsDto> GetStatsAsync(
        long userId,
        long businessId,
        int days,
        CancellationToken cancellationToken = default);

    Task<OwnerBusinessProfileDto> GetProfileAsync(
        long userId,
        long businessId,
        CancellationToken cancellationToken = default);

    Task<OwnerBusinessProfileDto> UpdateProfileAsync(
        long userId,
        long businessId,
        UpdateBusinessProfileRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<OwnerCampaignDto>> ListCampaignsAsync(
        long userId,
        long businessId,
        CancellationToken cancellationToken = default);

    Task<OwnerCampaignDto> CreateCampaignAsync(
        long userId,
        long businessId,
        SaveCampaignRequest request,
        CancellationToken cancellationToken = default);

    Task<OwnerCampaignDto> UpdateCampaignAsync(
        long userId,
        long businessId,
        long campaignId,
        SaveCampaignRequest request,
        CancellationToken cancellationToken = default);

    Task<OwnerCampaignDto> SetCampaignActiveAsync(
        long userId,
        long businessId,
        long campaignId,
        bool isActive,
        CancellationToken cancellationToken = default);

    Task DeleteCampaignAsync(
        long userId,
        long businessId,
        long campaignId,
        CancellationToken cancellationToken = default);

    Task<OwnerImagesDto> GetImagesAsync(
        long userId,
        long businessId,
        CancellationToken cancellationToken = default);

    Task<OwnerImagesDto> AddImageAsync(
        long userId,
        long businessId,
        ImageUpload upload,
        string? altText,
        CancellationToken cancellationToken = default);

    Task<OwnerImagesDto> SetCoverImageAsync(
        long userId,
        long businessId,
        long imageId,
        CancellationToken cancellationToken = default);

    Task<OwnerImagesDto> ReorderImagesAsync(
        long userId,
        long businessId,
        ReorderImagesRequest request,
        CancellationToken cancellationToken = default);

    Task<OwnerImagesDto> DeleteImageAsync(
        long userId,
        long businessId,
        long imageId,
        CancellationToken cancellationToken = default);

    Task<OwnerImagesDto> SetLogoAsync(
        long userId,
        long businessId,
        ImageUpload upload,
        CancellationToken cancellationToken = default);

    Task<OwnerImagesDto> DeleteLogoAsync(
        long userId,
        long businessId,
        CancellationToken cancellationToken = default);
}
