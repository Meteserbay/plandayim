using Plandayim.Application.Common;

namespace Plandayim.Infrastructure.Common;

public static class WebsiteUrl
{
    // Profilde link olarak gösterildiği için sadece http/https kabul edilir;
    // "javascript:" gibi adresler ziyaretçinin tarayıcısında kod çalıştırabilir.
    public static string? Normalize(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var trimmed = value.Trim();

        if (!trimmed.Contains("://", StringComparison.Ordinal))
        {
            trimmed = $"https://{trimmed}";
        }

        if (!Uri.TryCreate(trimmed, UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps) ||
            !uri.Host.Contains('.'))
        {
            throw new RequestValidationException(
                "Geçerli bir web sitesi adresi girin (örn. https://ornek.com).");
        }

        return uri.ToString();
    }
}
