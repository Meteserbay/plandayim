using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using Plandayim.Api.Admin;
using Plandayim.Api.Auth;

namespace Plandayim.Api.Controllers;

[ApiController]
[Route("api/admin/auth")]
public sealed class AdminAuthController : ControllerBase
{
    private readonly AdminOptions _options;
    private readonly ILogger<AdminAuthController> _logger;

    public AdminAuthController(
        IOptions<AdminOptions> options,
        ILogger<AdminAuthController> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    [HttpPost("login")]
    [EnableRateLimiting(RateLimitPolicies.AdminLogin)]
    public async Task<IActionResult> Login(
        [FromBody] AdminLoginRequest request)
    {
        if (!_options.IsConfigured)
        {
            _logger.LogWarning(
                "Admin login attempted but Admin:Email / Admin:Password are not configured.");

            return Problem(
                statusCode: StatusCodes.Status503ServiceUnavailable,
                title: "Admin girişi henüz yapılandırılmamış.");
        }

        var emailMatches = string.Equals(
            request.Email.Trim(),
            _options.Email,
            StringComparison.OrdinalIgnoreCase);

        // Şifre her durumda sabit sürede karşılaştırılır.
        var passwordMatches = FixedTimeEquals(
            request.Password,
            _options.Password!);

        if (!emailMatches || !passwordMatches)
        {
            return Problem(
                statusCode: StatusCodes.Status401Unauthorized,
                title: "E-posta veya şifre hatalı.");
        }

        var identity = new ClaimsIdentity(
            [
                new Claim(ClaimTypes.Name, _options.Email!),
                new Claim(ClaimTypes.Role, "Admin")
            ],
            AuthSchemes.Admin);

        await HttpContext.SignInAsync(
            AuthSchemes.Admin,
            new ClaimsPrincipal(identity));

        return Ok(new { email = _options.Email });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(AuthSchemes.Admin);

        return NoContent();
    }

    [Authorize(Policy = AuthPolicies.Admin)]
    [HttpGet("me")]
    public IActionResult Me()
    {
        return Ok(new { email = User.Identity!.Name });
    }

    private static bool FixedTimeEquals(string left, string right)
    {
        var leftHash = SHA256.HashData(Encoding.UTF8.GetBytes(left));
        var rightHash = SHA256.HashData(Encoding.UTF8.GetBytes(right));

        return CryptographicOperations.FixedTimeEquals(leftHash, rightHash);
    }
}
