namespace Plandayim.Api.Admin;

/// <summary>
/// Tek admin hesabının bilgileri. Kaynak koda yazılmaz; geliştirmede
/// user-secrets, sunucuda ortam değişkenleri ile verilir:
/// Admin__Email ve Admin__Password.
/// </summary>
public sealed class AdminOptions
{
    public const string SectionName = "Admin";

    public string? Email { get; init; }

    public string? Password { get; init; }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(Email) &&
        !string.IsNullOrWhiteSpace(Password);
}
