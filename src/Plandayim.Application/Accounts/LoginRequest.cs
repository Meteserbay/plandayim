using System.ComponentModel.DataAnnotations;

namespace Plandayim.Application.Accounts;

public sealed class LoginRequest
{
    [Required(ErrorMessage = "E-posta zorunludur.")]
    public string Email { get; init; } = null!;

    [Required(ErrorMessage = "Şifre zorunludur.")]
    public string Password { get; init; } = null!;
}
