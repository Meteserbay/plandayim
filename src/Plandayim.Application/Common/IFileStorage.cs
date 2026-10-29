namespace Plandayim.Application.Common;

/// <summary>
/// Yüklenen dosyaların saklandığı yer. Şimdilik yerel disk; ileride bulut
/// depolamaya geçmek için sadece bu arayüzün implementasyonu değişir.
/// </summary>
public interface IFileStorage
{
    /// <summary>Dosyayı kaydeder ve herkese açık adresini döner.</summary>
    Task<string> SaveAsync(
        Stream content,
        string folder,
        string extension,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Bu depolamaya ait bir adresse dosyayı siler; dış adresleri
    /// (örn. eski seed görselleri) yok sayar.
    /// </summary>
    Task DeleteAsync(
        string publicUrl,
        CancellationToken cancellationToken = default);
}
