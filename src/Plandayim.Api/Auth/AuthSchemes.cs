using System.Security.Claims;

namespace Plandayim.Api.Auth;

// Admin ve firma sahibi oturumları ayrı çerezlerde tutulur; biri diğerinin
// endpoint'lerine erişemez.
public static class AuthSchemes
{
    public const string Admin = "Admin";
    public const string Owner = "Owner";
}

public static class AuthPolicies
{
    public const string Admin = "Admin";
    public const string Owner = "Owner";
}

public static class RateLimitPolicies
{
    public const string AdminLogin = "admin-login";
    public const string Account = "account";
}

public static class ClaimsPrincipalExtensions
{
    public static long GetUserId(this ClaimsPrincipal principal)
    {
        var value = principal.FindFirstValue(ClaimTypes.NameIdentifier);

        return long.TryParse(value, out var userId)
            ? userId
            : throw new InvalidOperationException("User id claim is missing.");
    }
}
