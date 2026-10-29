using System.ComponentModel.DataAnnotations;
using Plandayim.Domain.BusinessApplications;

namespace Plandayim.Application.BusinessApplications;

public sealed class CreateBusinessApplicationRequest
{
    public long? BusinessId { get; init; }

    [Required(ErrorMessage = "İşletme adı zorunludur.")]
    [MaxLength(200, ErrorMessage = "İşletme adı en fazla 200 karakter olabilir.")]
    public string BusinessName { get; init; } = null!;

    [Required(ErrorMessage = "Ad soyad zorunludur.")]
    [MaxLength(150, ErrorMessage = "Ad soyad en fazla 150 karakter olabilir.")]
    public string ContactName { get; init; } = null!;

    [Required(ErrorMessage = "Telefon numarası zorunludur.")]
    [MaxLength(30, ErrorMessage = "Telefon numarası en fazla 30 karakter olabilir.")]
    [RegularExpression(
        @"^[0-9+()\s-]{10,30}$",
        ErrorMessage = "Geçerli bir telefon numarası girin.")]
    public string PhoneNumber { get; init; } = null!;

    [Required(ErrorMessage = "E-posta zorunludur.")]
    [MaxLength(254, ErrorMessage = "E-posta en fazla 254 karakter olabilir.")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi girin.")]
    public string Email { get; init; } = null!;

    [MaxLength(2000, ErrorMessage = "Mesaj en fazla 2000 karakter olabilir.")]
    public string? Message { get; init; }

    [EnumDataType(
        typeof(BusinessApplicationType),
        ErrorMessage = "Geçersiz başvuru türü.")]
    public BusinessApplicationType Type { get; init; }
}
