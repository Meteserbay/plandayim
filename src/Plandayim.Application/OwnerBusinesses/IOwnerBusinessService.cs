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
}
