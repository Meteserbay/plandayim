using System.ComponentModel.DataAnnotations;

namespace Plandayim.Application.Accounts;

public sealed class RegisterRequest
{
    [Required(ErrorMessage = "Ad soyad zorunludur.")]
    [MaxLength(150, ErrorMessage = "Ad soyad en fazla 150 karakter olabilir.")]
    public string FullName { get; init; } = null!;

    [Required(ErrorMessage = "E-posta zorunludur.")]
    [MaxLength(254, ErrorMessage = "E-posta en fazla 254 karakter olabilir.")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi girin.")]
    public string Email { get; init; } = null!;

    [Required(ErrorMessage = "Şifre zorunludur.")]
    [MinLength(8, ErrorMessage = "Şifre en az 8 karakter olmalı.")]
    [MaxLength(128, ErrorMessage = "Şifre en fazla 128 karakter olabilir.")]
    public string Password { get; init; } = null!;
}
