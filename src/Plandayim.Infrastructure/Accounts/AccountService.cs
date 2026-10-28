using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Plandayim.Application.Accounts;
using Plandayim.Application.Common;
using Plandayim.Domain.Users;
using Plandayim.Infrastructure.Persistence;

namespace Plandayim.Infrastructure.Accounts;

public sealed class AccountService : IAccountService
{
    private readonly PlandayimDbContext _dbContext;
    private readonly IPasswordHasher<User> _passwordHasher;

    public AccountService(
        PlandayimDbContext dbContext,
        IPasswordHasher<User> passwordHasher)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
    }

    public async Task<AccountDto> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken = default)
    {
        var email = User.NormalizeEmail(request.Email);

        var emailTaken = await _dbContext.Users
            .AnyAsync(x => x.Email == email, cancellationToken);

        if (emailTaken)
        {
            throw new RequestValidationException(
                "Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.");
        }

        var user = new User(request.FullName.Trim(), email);

        user.SetPasswordHash(
            _passwordHasher.HashPassword(user, request.Password));
        user.RecordLogin();

        _dbContext.Users.Add(user);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new AccountDto(user.Id, user.FullName, user.Email, []);
    }

    public async Task<AccountDto?> ValidateCredentialsAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        var email = User.NormalizeEmail(request.Email);

        var user = await _dbContext.Users
            .FirstOrDefaultAsync(x => x.Email == email, cancellationToken);

        if (user is null)
        {
            return null;
        }

        var result = _passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password);

        if (result == PasswordVerificationResult.Failed)
        {
            return null;
        }

        // Hash algoritması güncellendiyse şifre yeni formatta yeniden saklanır.
        if (result == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.SetPasswordHash(
                _passwordHasher.HashPassword(user, request.Password));
        }

        user.RecordLogin();

        await _dbContext.SaveChangesAsync(cancellationToken);

        return await GetAsync(user.Id, cancellationToken);
    }

    public async Task<AccountDto?> GetAsync(
        long userId,
        CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users
            .AsNoTracking()
            .Where(x => x.Id == userId)
            .Select(x => new { x.Id, x.FullName, x.Email })
            .FirstOrDefaultAsync(cancellationToken);

        if (user is null)
        {
            return null;
        }

        var businesses = await _dbContext.Businesses
            .AsNoTracking()
            .Where(x => x.OwnerUserId == userId)
            .OrderBy(x => x.Name)
            .Select(x => new OwnedBusinessDto(x.Id, x.Name, x.Slug))
            .ToListAsync(cancellationToken);

        return new AccountDto(user.Id, user.FullName, user.Email, businesses);
    }
}
