using Microsoft.EntityFrameworkCore;
using Plandayim.Infrastructure.Persistence;
using Plandayim.Infrastructure.Persistence.Seed;
using Plandayim.Application.Categories;
using Plandayim.Infrastructure.Categories;
using Plandayim.Application.Locations;
using Plandayim.Infrastructure.Locations;
using Plandayim.Application.Businesses;
using Plandayim.Infrastructure.Businesses;

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

builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ILocationService, LocationService>();
builder.Services.AddScoped<IBusinessService, BusinessService>();
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();
app.UseCors("Frontend");
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
