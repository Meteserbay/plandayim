using System.ComponentModel.DataAnnotations;

namespace Plandayim.Application.AdminBusinesses;

public sealed record AdminBusinessListItemDto(
    long Id,
    string Name,
    string Slug,
    string CityName,
    string DistrictName,
    string? PrimaryCategory,
    bool IsActive,
    bool IsVerified,
    string? OwnerEmail,
    DateTime CreatedAtUtc);

public sealed record AdminBusinessListDto(
    IReadOnlyList<AdminBusinessListItemDto> Items,
    int TotalCount,
    int Page,
    int PageSize);

public sealed record AdminBusinessDetailDto(
    long Id,
    string Name,
    string Slug,
    string? Description,
    string PhoneNumber,
    string? WhatsAppNumber,
    string? Email,
    string? WebsiteUrl,
    string? Address,
    long CityId,
    long DistrictId,
    IReadOnlyList<long> CategoryIds,
    long? PrimaryCategoryId,
    IReadOnlyList<long> ServiceAreaDistrictIds,
    bool IsActive,
    bool IsVerified,
    long? OwnerUserId,
    string? OwnerEmail,
    string? OwnerFullName);

public sealed class UpdateAdminBusinessRequest
{
    [Required(ErrorMessage = "İşletme adı zorunludur.")]
    [MaxLength(200, ErrorMessage = "İşletme adı en fazla 200 karakter olabilir.")]
    public string Name { get; init; } = null!;

    // Slug profil adresini belirler (/business/{slug}); değişirse eski
    // linkler çalışmaz.
    [Required(ErrorMessage = "Profil adresi zorunludur.")]
    [MaxLength(220, ErrorMessage = "Profil adresi en fazla 220 karakter olabilir.")]
    [RegularExpression(
        @"^[a-z0-9]+(-[a-z0-9]+)*$",
        ErrorMessage = "Profil adresi sadece küçük harf, rakam ve tire içerebilir (örn. ornek-organizasyon).")]
    public string Slug { get; init; } = null!;

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

    [MaxLength(254, ErrorMessage = "E-posta en fazla 254 karakter olabilir.")]
    [RegularExpression(
        @"^\s*$|^[^@\s]+@[^@\s]+\.[^@\s]+$",
        ErrorMessage = "Geçerli bir e-posta adresi girin.")]
    public string? Email { get; init; }

    [MaxLength(500, ErrorMessage = "Web sitesi adresi en fazla 500 karakter olabilir.")]
    public string? WebsiteUrl { get; init; }

    [MaxLength(500, ErrorMessage = "Adres en fazla 500 karakter olabilir.")]
    public string? Address { get; init; }

    public long? CityId { get; init; }

    public long? DistrictId { get; init; }

    public IReadOnlyList<long> CategoryIds { get; init; } = [];

    public long? PrimaryCategoryId { get; init; }

    public IReadOnlyList<long> ServiceAreaDistrictIds { get; init; } = [];
}
