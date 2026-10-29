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
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Hosting.WindowsServices;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    // Windows servisi olarak çalışırken içerik kökü uygulama klasörüdür.
    ContentRootPath = WindowsServiceHelpers.IsWindowsService()
        ? AppContext.BaseDirectory
        : null
});

builder.Host.UseWindowsService(options => options.ServiceName = "Plandayim");

// Sunucuya özel ayarlar (bağlantı dizesi, admin şifresi, klasörler) uygulama
// klasörünün yanındaki config\appsettings.local.json dosyasında durur; her
// güncellemede uygulama klasörü değişse de bu dosya korunur ve git'e girmez.
builder.Configuration.AddJsonFile(
    Path.Combine(builder.Environment.ContentRootPath, "..", "config", "appsettings.local.json"),
    optional: true,
    reloadOnChange: false);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("DefaultConnection connection string was not found.");
var seedSampleBusinesses = builder.Configuration.GetValue<bool>("Seed:SampleBusinesses");

builder.Services.AddDbContext<PlandayimDbContext>(options =>
{
    options.UseSqlServer(connectionString);

    options.UseSeeding((context, _) =>
    {
        DatabaseSeeder.Seed(context, seedSampleBusinesses);
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
builder.Services.AddOpenApi();

// Site Cloudflare Tunnel arkasında çalışır: istek uygulamaya localhost'tan
// düz HTTP olarak gelir. Gerçek ziyaretçi IP'si (hız sınırı için) ve HTTPS
// bilgisi (güvenli çerezler için) yönlendirme başlıklarından okunur. Varsayılan
// olarak bu başlıklara sadece localhost'tan gelen isteklerde güvenilir.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders =
        ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
});

// Oturum çerezlerini imzalayan anahtarlar kalıcı bir klasörde tutulur; aksi
// halde yeniden başlatmada herkesin oturumu düşebilir.
var dataProtection = builder.Services
    .AddDataProtection()
    .SetApplicationName("Plandayim");
var keysPath = builder.Configuration["DataProtection:KeysPath"];

if (!string.IsNullOrWhiteSpace(keysPath))
{
    dataProtection.PersistKeysToFileSystem(new DirectoryInfo(keysPath));
}

var app = builder.Build();
app.UseForwardedHeaders();
app.UseExceptionHandler();

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

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
// Yayında frontend (web/dist) uygulamanın wwwroot klasörüne kopyalanır ve
// aynı adresten servis edilir; böylece site ve API tek alan adında çalışır.
// HTTPS yönlendirmesini Cloudflare yaptığı için burada yapılmaz.
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Bilinmeyen API adresleri sayfa yerine 404 döner.
app.Map("/api/{**rest}", () => Results.Problem(
    statusCode: StatusCodes.Status404NotFound,
    title: "Kayıt bulunamadı."));

// /panel, /business/... gibi sayfa adresleri React uygulamasına yönlenir.
if (File.Exists(Path.Combine(app.Environment.WebRootPath ?? "", "index.html")))
{
    app.MapFallbackToFile("index.html");
}

app.Run();
