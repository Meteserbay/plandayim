using Plandayim.Application.Common;
using Plandayim.Application.OwnerBusinesses;

namespace Plandayim.Infrastructure.Storage;

public static class ImageFileValidator
{
    public const long MaxBytes = 5 * 1024 * 1024;

    /// <summary>
    /// Yüklemeyi belleğe alır ve gerçek türünü dosyanın ilk byte'larından
    /// belirler. Uzantıya veya istemcinin bildirdiği türe güvenilmez; SVG gibi
    /// betik içerebilen biçimler kabul edilmez.
    /// </summary>
    public static async Task<(MemoryStream Content, string Extension)> ReadAsync(
        ImageUpload upload,
        CancellationToken cancellationToken)
    {
        if (upload.Length <= 0)
        {
            throw new RequestValidationException("Bir görsel seçmelisin.");
        }

        if (upload.Length > MaxBytes)
        {
            throw new RequestValidationException(
                "Görsel en fazla 5 MB olabilir.");
        }

        var buffer = new MemoryStream();
        var chunk = new byte[81920];
        int read;

        // Bildirilen boyuta güvenmeden okurken de sınır uygulanır.
        while ((read = await upload.Content.ReadAsync(chunk, cancellationToken)) > 0)
        {
            if (buffer.Length + read > MaxBytes)
            {
                throw new RequestValidationException(
                    "Görsel en fazla 5 MB olabilir.");
            }

            buffer.Write(chunk, 0, read);
        }

        var extension = DetectExtension(buffer.GetBuffer().AsSpan(0, (int)buffer.Length))
            ?? throw new RequestValidationException(
                "Sadece JPEG, PNG veya WebP görsel yükleyebilirsin.");

        buffer.Position = 0;

        return (buffer, extension);
    }

    private static string? DetectExtension(ReadOnlySpan<byte> bytes)
    {
        if (bytes.Length >= 3 &&
            bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF)
        {
            return ".jpg";
        }

        if (bytes.Length >= 8 &&
            bytes[..8].SequenceEqual(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }))
        {
            return ".png";
        }

        if (bytes.Length >= 12 &&
            bytes[..4].SequenceEqual("RIFF"u8) &&
            bytes[8..12].SequenceEqual("WEBP"u8))
        {
            return ".webp";
        }

        return null;
    }
}
