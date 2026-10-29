using Microsoft.EntityFrameworkCore;
using Plandayim.Application.Common;
using Plandayim.Domain.Businesses;
using Plandayim.Infrastructure.Persistence;

namespace Plandayim.Infrastructure.Businesses;

/// <summary>
/// Bir firmanın konumu, kategorileri ve hizmet bölgeleri. Firma
/// oluşturma (başvuru onayı) ve admin düzenlemesi aynı kuralları kullanır.
/// </summary>
public sealed record BusinessClassification(
    long CityId,
    long DistrictId,
    IReadOnlyList<long> CategoryIds,
    long PrimaryCategoryId,
    IReadOnlyList<long> ServiceAreaDistrictIds)
{
    public static async Task<BusinessClassification> ValidateAsync(
        PlandayimDbContext dbContext,
        long? cityId,
        long? districtId,
        IReadOnlyList<long> categoryIds,
        long? primaryCategoryId,
        IReadOnlyList<long> serviceAreaDistrictIds,
        CancellationToken cancellationToken)
    {
        if (!cityId.HasValue)
        {
            throw new RequestValidationException("Şehir seçmelisin.");
        }

        if (!districtId.HasValue)
        {
            throw new RequestValidationException("İlçe seçmelisin.");
        }

        var districtBelongsToCity = await dbContext.Districts
            .AsNoTracking()
            .AnyAsync(
                x => x.Id == districtId && x.CityId == cityId,
                cancellationToken);

        if (!districtBelongsToCity)
        {
            throw new RequestValidationException(
                "Seçilen ilçe bu şehre ait değil.");
        }

        var distinctCategoryIds = categoryIds.Distinct().ToList();

        if (distinctCategoryIds.Count == 0)
        {
            throw new RequestValidationException(
                "En az bir kategori seçmelisin.");
        }

        var existingCategoryCount = await dbContext.Categories
            .AsNoTracking()
            .CountAsync(
                x => distinctCategoryIds.Contains(x.Id),
                cancellationToken);

        if (existingCategoryCount != distinctCategoryIds.Count)
        {
            throw new RequestValidationException(
                "Seçilen kategorilerden biri bulunamadı.");
        }

        var primary = primaryCategoryId ?? distinctCategoryIds[0];

        if (!distinctCategoryIds.Contains(primary))
        {
            throw new RequestValidationException(
                "Ana kategori seçilen kategorilerden biri olmalı.");
        }

        // Arama ilçeye göre hizmet bölgelerinden yapıldığı için firmanın
        // kendi ilçesi her zaman hizmet bölgesine eklenir.
        var areaIds = serviceAreaDistrictIds
            .Append(districtId.Value)
            .Distinct()
            .ToList();

        var existingDistrictCount = await dbContext.Districts
            .AsNoTracking()
            .CountAsync(x => areaIds.Contains(x.Id), cancellationToken);

        if (existingDistrictCount != areaIds.Count)
        {
            throw new RequestValidationException(
                "Seçilen hizmet bölgelerinden biri bulunamadı.");
        }

        return new BusinessClassification(
            cityId.Value,
            districtId.Value,
            distinctCategoryIds,
            primary,
            areaIds);
    }

    /// <summary>
    /// Firmanın kategori ve hizmet bölgesi kayıtlarını bu sınıflandırmayla
    /// değiştirir. Kaydetmek çağıranın sorumluluğundadır.
    /// </summary>
    public async Task ApplyToAsync(
        PlandayimDbContext dbContext,
        long businessId,
        CancellationToken cancellationToken)
    {
        var currentCategories = await dbContext.BusinessCategories
            .Where(x => x.BusinessId == businessId)
            .ToListAsync(cancellationToken);

        var currentAreas = await dbContext.BusinessServiceAreas
            .Where(x => x.BusinessId == businessId)
            .ToListAsync(cancellationToken);

        // Silip yeniden eklemek yerine fark uygulanır; aynı anahtarlı bir
        // kaydı aynı anda silip eklemek EF Core'da takip çakışması yaratır.
        dbContext.BusinessCategories.RemoveRange(
            currentCategories.Where(x => !CategoryIds.Contains(x.CategoryId)));

        foreach (var category in currentCategories.Where(x => CategoryIds.Contains(x.CategoryId)))
        {
            if (category.CategoryId == PrimaryCategoryId)
            {
                category.SetAsPrimary();
            }
            else
            {
                category.RemoveAsPrimary();
            }
        }

        dbContext.BusinessCategories.AddRange(
            CategoryIds
                .Where(id => currentCategories.All(x => x.CategoryId != id))
                .Select(categoryId => new BusinessCategory(
                    businessId,
                    categoryId,
                    categoryId == PrimaryCategoryId)));

        dbContext.BusinessServiceAreas.RemoveRange(
            currentAreas.Where(x => !ServiceAreaDistrictIds.Contains(x.DistrictId)));

        dbContext.BusinessServiceAreas.AddRange(
            ServiceAreaDistrictIds
                .Where(id => currentAreas.All(x => x.DistrictId != id))
                .Select(districtId =>
                    new BusinessServiceArea(businessId, districtId)));
    }
}
