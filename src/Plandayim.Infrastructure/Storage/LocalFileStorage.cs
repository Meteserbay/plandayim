using Plandayim.Application.Common;

namespace Plandayim.Infrastructure.Storage;

public sealed class LocalFileStorageOptions
{
    public const string SectionName = "Storage";

    /// <summary>Dosyaların yazılacağı klasör (wwwroot/uploads).</summary>
    public string RootPath { get; set; } = null!;

    /// <summary>Klasörün dışarıdan erişilen adresi, örn. http://localhost:5171/uploads.</summary>
    public string PublicBaseUrl { get; set; } = null!;
}

public sealed class LocalFileStorage : IFileStorage
{
    private readonly LocalFileStorageOptions _options;

    public LocalFileStorage(LocalFileStorageOptions options)
    {
        _options = options;
    }

    public async Task<string> SaveAsync(
        Stream content,
        string folder,
        string extension,
        CancellationToken cancellationToken = default)
    {
        // Dosya adı her zaman sunucuda üretilir; kullanıcının verdiği ad
        // kullanılmaz (yol enjeksiyonu ve çakışma olmaz).
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var directory = Path.Combine(_options.RootPath, folder);

        Directory.CreateDirectory(directory);

        var path = Path.Combine(directory, fileName);

        await using (var file = File.Create(path))
        {
            await content.CopyToAsync(file, cancellationToken);
        }

        return $"{_options.PublicBaseUrl.TrimEnd('/')}/{folder}/{fileName}";
    }

    public Task DeleteAsync(
        string publicUrl,
        CancellationToken cancellationToken = default)
    {
        var prefix = _options.PublicBaseUrl.TrimEnd('/') + "/";

        if (!publicUrl.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
        {
            return Task.CompletedTask;
        }

        var relative = publicUrl[prefix.Length..]
            .Replace('/', Path.DirectorySeparatorChar);
        var root = Path.GetFullPath(_options.RootPath);
        var path = Path.GetFullPath(Path.Combine(root, relative));

        // Kök klasörün dışına çıkan bir yol asla silinmez.
        if (path.StartsWith(root + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase) &&
            File.Exists(path))
        {
            File.Delete(path);
        }

        return Task.CompletedTask;
    }
}
