using System.ComponentModel.DataAnnotations;

namespace Plandayim.Api.Admin;

public sealed class AdminLoginRequest
{
    [Required(ErrorMessage = "E-posta zorunludur.")]
    public string Email { get; init; } = null!;

    [Required(ErrorMessage = "Şifre zorunludur.")]
    public string Password { get; init; } = null!;
}
