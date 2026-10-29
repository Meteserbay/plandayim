using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Plandayim.Api.Auth;
using Plandayim.Application.Accounts;
using Plandayim.Application.BusinessApplications;

namespace Plandayim.Api.Controllers;

[ApiController]
[Route("api/account")]
public sealed class AccountController : ControllerBase
{
    private readonly IAccountService _accountService;
    private readonly IBusinessApplicationService _applicationService;

    public AccountController(
        IAccountService accountService,
        IBusinessApplicationService applicationService)
    {
        _accountService = accountService;
        _applicationService = applicationService;
    }

    [HttpPost("register")]
    [EnableRateLimiting(RateLimitPolicies.Account)]
    public async Task<ActionResult<AccountDto>> Register(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var account = await _accountService.RegisterAsync(
            request,
            cancellationToken);

        await SignInAsync(account);

        return Ok(account);
    }

    [HttpPost("login")]
    [EnableRateLimiting(RateLimitPolicies.Account)]
    public async Task<ActionResult<AccountDto>> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var account = await _accountService.ValidateCredentialsAsync(
            request,
            cancellationToken);

        if (account is null)
        {
            return Problem(
                statusCode: StatusCodes.Status401Unauthorized,
                title: "E-posta veya şifre hatalı.");
        }

        await SignInAsync(account);

        return Ok(account);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(AuthSchemes.Owner);

        return NoContent();
    }

    [Authorize(Policy = AuthPolicies.Owner)]
    [HttpGet("me")]
    public async Task<ActionResult<AccountDto>> Me(
        CancellationToken cancellationToken)
    {
        var account = await _accountService.GetAsync(
            User.GetUserId(),
            cancellationToken);

        if (account is null)
        {
            // Hesap silinmişse eski çerez geçersiz sayılır.
            await HttpContext.SignOutAsync(AuthSchemes.Owner);
            return Unauthorized();
        }

        return Ok(account);
    }

    [Authorize(Policy = AuthPolicies.Owner)]
    [HttpGet("applications")]
    public async Task<ActionResult<IReadOnlyList<BusinessApplicationDto>>> Applications(
        CancellationToken cancellationToken)
    {
        return Ok(await _applicationService.ListForApplicantAsync(
            User.GetUserId(),
            cancellationToken));
    }

    private Task SignInAsync(AccountDto account)
    {
        var identity = new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, account.Id.ToString()),
                new Claim(ClaimTypes.Name, account.Email)
            ],
            AuthSchemes.Owner);

        return HttpContext.SignInAsync(
            AuthSchemes.Owner,
            new ClaimsPrincipal(identity));
    }
}
