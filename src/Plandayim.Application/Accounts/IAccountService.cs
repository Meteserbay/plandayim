namespace Plandayim.Application.Accounts;

public interface IAccountService
{
    Task<AccountDto> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// E-posta ve şifre doğruysa hesabı, değilse null döner.
    /// </summary>
    Task<AccountDto?> ValidateCredentialsAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default);

    Task<AccountDto?> GetAsync(
        long userId,
        CancellationToken cancellationToken = default);
}
