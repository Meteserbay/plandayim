using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Plandayim.Domain.Locations;

namespace Plandayim.Infrastructure.Persistence.Seed;

public static class LocationSeeder
{
    public static void Seed(DbContext context)
    {
        if (context.Set<City>().Any())
        {
            return;
        }

        var locations = ReadLocations();

        foreach (var location in locations)
        {
            var city = new City(location.Name);

            context.Set<City>().Add(city);
            context.SaveChanges();

            var districts = location.Districts
                .Select(districtName => new District(districtName, city.Id))
                .ToList();

            context.Set<District>().AddRange(districts);
            context.SaveChanges();
        }
    }

    public static async Task SeedAsync(
        DbContext context,
        CancellationToken cancellationToken)
    {
        if (await context.Set<City>().AnyAsync(cancellationToken))
        {
            return;
        }

        var locations = await ReadLocationsAsync(cancellationToken);

        foreach (var location in locations)
        {
            var city = new City(location.Name);

            context.Set<City>().Add(city);
            await context.SaveChangesAsync(cancellationToken);

            var districts = location.Districts
                .Select(districtName => new District(districtName, city.Id))
                .ToList();

            context.Set<District>().AddRange(districts);
            await context.SaveChangesAsync(cancellationToken);
        }
    }

    private static List<LocationSeedModel> ReadLocations()
    {
        var path = GetLocationFilePath();

        var json = File.ReadAllText(path);

        return JsonSerializer.Deserialize<List<LocationSeedModel>>(
                   json,
                   JsonOptions)
               ?? [];
    }

    private static async Task<List<LocationSeedModel>> ReadLocationsAsync(
        CancellationToken cancellationToken)
    {
        var path = GetLocationFilePath();

        await using var stream = File.OpenRead(path);

        return await JsonSerializer.DeserializeAsync<List<LocationSeedModel>>(
                   stream,
                   JsonOptions,
                   cancellationToken)
               ?? [];
    }

    private static string GetLocationFilePath()
    {
        return Path.Combine(
            AppContext.BaseDirectory,
            "Persistence",
            "Seed",
            "Data",
            "locations.json");
    }

    private static readonly JsonSerializerOptions JsonOptions =
        new()
        {
            PropertyNameCaseInsensitive = true
        };

    private sealed class LocationSeedModel
    {
        public string Name { get; init; } = null!;

        public List<string> Districts { get; init; } = [];
    }
}