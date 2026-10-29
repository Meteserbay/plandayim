using Plandayim.Domain.Common;

namespace Plandayim.Domain.Users;

public class User : BaseEntity
{
    private User()
    {
    }

    public User(string fullName, string email)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(fullName);
        ArgumentException.ThrowIfNullOrWhiteSpace(email);

        FullName = fullName;
        Email = NormalizeEmail(email);
        CreatedAtUtc = DateTime.UtcNow;
    }

    public string FullName { get; private set; } = null!;

    public string Email { get; private set; } = null!;

    public string PasswordHash { get; private set; } = null!;

    public DateTime? LastLoginAtUtc { get; private set; }

    public static string NormalizeEmail(string email)
    {
        return email.Trim().ToLowerInvariant();
    }

    public void SetPasswordHash(string passwordHash)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(passwordHash);

        PasswordHash = passwordHash;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void RecordLogin()
    {
        LastLoginAtUtc = DateTime.UtcNow;
    }
}
