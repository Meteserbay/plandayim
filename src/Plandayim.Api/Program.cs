using Microsoft.EntityFrameworkCore;
using Plandayim.Infrastructure.Persistence;
using Plandayim.Infrastructure.Persistence.Seed;
using Plandayim.Application.Categories;
using Plandayim.Infrastructure.Categories;
using Plandayim.Application.Locations;
using Plandayim.Infrastructure.Locations;
using Plandayim.Application.Businesses;
using Plandayim.Infrastructure.Businesses;
using Plandayim.Application.BusinessApplications;
using Plandayim.Infrastructure.BusinessApplications;
using Plandayim.Api.ErrorHandling;
using Plandayim.Api.Admin;
using Plandayim.Api.Auth;
using Plandayim.Application.Accounts;
using Plandayim.Infrastructure.Accounts;
using Plandayim.Application.OwnerBusinesses;
using Plandayim.Infrastructure.OwnerBusinesses;
using Plandayim.Domain.Users;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using System.Threading.RateLimiting;
using Microsoft.Extensions.FileProviders;
using Plandayim.Application.Common;
using Plandayim.Infrastructure.Storage;
using Plandayim.Application.AdminBusinesses;
using Plandayim.Infrastructure.AdminBusinesses;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("DefaultConnection connection string was not found.");

builder.Services.AddDbContext<PlandayimDbContext>(options =>
{
    options.UseSqlServer(connectionString);

    options.UseSeeding((context, _) =>
    {
        DatabaseSeeder.Seed(context);
    });

    options.UseAsyncSeeding(async (context, _, cancellationToken) =>
    {
        await DatabaseSeeder.SeedAsync(context, cancellationToken);
    });
});
builder.Services.AddScoped<
    IBusinessApplicationService,
    BusinessApplicationService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ILocationService, LocationService>();
builder.Services.AddScoped<IBusinessService, BusinessService>();
builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<ApiExceptionHandler>();
builder.Services.Configure<AdminOptions>(
    builder.Configuration.GetSection(AdminOptions.SectionName));
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IOwnerBusinessService, OwnerBusinessService>();
builder.Services.AddScoped<IAdminBusinessService, AdminBusinessService>();

// Yüklenen görseller wwwroot/uploads altında saklanır ve /uploads adresinden
// servis edilir. Sunucuda Storage:PublicBaseUrl gerçek alan adına ayarlanmalı.
var uploadsRoot = Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "uploads");
var storageOptions = new LocalFileStorageOptions
{
    RootPath = builder.Configuration["Storage:RootPath"] ?? uploadsRoot,
    PublicBaseUrl = builder.Configuration["Storage:PublicBaseUrl"]
        ?? "http://localhost:5171/uploads"
};
Directory.CreateDirectory(storageOptions.RootPath);
builder.Services.AddSingleton(storageOptions);
builder.Services.AddSingleton<IFileStorage, LocalFileStorage>();

static void ConfigureApiCookie(
    CookieAuthenticationOptions options,
    string cookieName,
    TimeSpan lifetime)
{
    options.Cookie.Name = cookieName;
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
    options.ExpireTimeSpan = lifetime;
    options.SlidingExpiration = true;

    // API olduğu için giriş sayfasına yönlendirmek yerine 401/403 döner.
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
}

builder.Services
    .AddAuthentication(AuthSchemes.Owner)
    .AddCookie(AuthSchemes.Admin, options =>
        ConfigureApiCookie(options, "plandayim_admin", TimeSpan.FromHours(8)))
    .AddCookie(AuthSchemes.Owner, options =>
        ConfigureApiCookie(options, "plandayim_user", TimeSpan.FromDays(14)));
builder.Services.AddAuthorizationBuilder()
    .AddPolicy(AuthPolicies.Admin, policy => policy
        .AddAuthenticationSchemes(AuthSchemes.Admin)
        .RequireRole("Admin"))
    .AddPolicy(AuthPolicies.Owner, policy => policy
        .AddAuthenticationSchemes(AuthSchemes.Owner)
        .RequireAuthenticatedUser());
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    static RateLimitPartition<string> PerIp(
        HttpContext httpContext,
        int permitLimit) =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = permitLimit,
                Window = TimeSpan.FromMinutes(1)
            });

    // Şifre denemelerini yavaşlatmak için IP başına dakikalık sınırlar.
    options.AddPolicy(
        RateLimitPolicies.AdminLogin,
        httpContext => PerIp(httpContext, 5));
    options.AddPolicy(
        RateLimitPolicies.Account,
        httpContext => PerIp(httpContext, 10));
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        // Yayında Cors:AllowedOrigins ayarı sitenin gerçek adresiyle verilmeli.
        var allowedOrigins = builder.Configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>() ?? ["http://localhost:5173"];

        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();
app.UseExceptionHandler();
app.UseCors("Frontend");
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(storageOptions.RootPath),
    RequestPath = "/uploads",
    OnPrepareResponse = context =>
    {
        // Tarayıcı dosyayı uzantısından başka bir türmüş gibi yorumlamasın.
        context.Context.Response.Headers.XContentTypeOptions = "nosniff";
        // Dosya adları benzersiz olduğu ve değişmediği için uzun süre önbelleklenir.
        context.Context.Response.Headers.CacheControl = "public,max-age=31536000,immutable";
    }
});
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
