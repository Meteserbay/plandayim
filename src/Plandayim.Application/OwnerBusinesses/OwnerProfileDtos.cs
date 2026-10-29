using System.ComponentModel.DataAnnotations;

namespace Plandayim.Application.OwnerBusinesses;

public sealed record OwnerBusinessProfileDto(
    string Name,
    string? Description,
    string PhoneNumber,
    string? WhatsAppNumber,
    string? Email,
    string? WebsiteUrl,
    string? Address);

public sealed class UpdateBusinessProfileRequest
{
    [MaxLength(2000, ErrorMessage = "Açıklama en fazla 2000 karakter olabilir.")]
    public string? Description { get; init; }

    [Required(ErrorMessage = "Telefon numarası zorunludur.")]
    [RegularExpression(
        @"^[0-9+()\s-]{10,30}$",
        ErrorMessage = "Geçerli bir telefon numarası girin.")]
    public string PhoneNumber { get; init; } = null!;

    [RegularExpression(
        @"^[0-9+()\s-]{10,30}$",
        ErrorMessage = "Geçerli bir WhatsApp numarası girin.")]
    public string? WhatsAppNumber { get; init; }

    // [EmailAddress] boş metni geçersiz saydığı için isteğe bağlı alanda
    // boş değeri kabul eden bir desen kullanılır.
    [MaxLength(254, ErrorMessage = "E-posta en fazla 254 karakter olabilir.")]
    [RegularExpression(
        @"^\s*$|^[^@\s]+@[^@\s]+\.[^@\s]+$",
        ErrorMessage = "Geçerli bir e-posta adresi girin.")]
    public string? Email { get; init; }

    [MaxLength(500, ErrorMessage = "Web sitesi adresi en fazla 500 karakter olabilir.")]
    public string? WebsiteUrl { get; init; }

    [MaxLength(500, ErrorMessage = "Adres en fazla 500 karakter olabilir.")]
    public string? Address { get; init; }
}
