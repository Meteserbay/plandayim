using Microsoft.EntityFrameworkCore;
using Plandayim.Domain.Categories;

namespace Plandayim.Infrastructure.Persistence.Seed;

public static class DatabaseSeeder
{
    public static void Seed(DbContext context)
    {
        SeedCategories(context);
        LocationSeeder.Seed(context);
        BusinessSeeder.Seed(context);
    }

    public static async Task SeedAsync(
        DbContext context,
        CancellationToken cancellationToken)
    {
        await SeedCategoriesAsync(context, cancellationToken);
        await LocationSeeder.SeedAsync(context, cancellationToken);
    }

    private static void SeedCategories(DbContext context)
    {
        if (context.Set<Category>().Any())
        {
            return;
        }

        var categories = CreateCategories();

        context.Set<Category>().AddRange(categories);
        context.SaveChanges();
    }

    private static async Task SeedCategoriesAsync(
        DbContext context,
        CancellationToken cancellationToken)
    {
        if (await context.Set<Category>().AnyAsync(cancellationToken))
        {
            return;
        }

        var categories = CreateCategories();

        context.Set<Category>().AddRange(categories);

        await context.SaveChangesAsync(cancellationToken);
    }

    private static Category[] CreateCategories()
    {
        return
        [
            new Category("Düğün Salonu", "dugun-salonu"),
            new Category("Düğün Organizasyonu", "dugun-organizasyonu"),
            new Category("Kına Organizasyonu", "kina-organizasyonu"),
            new Category("Nişan Organizasyonu", "nisan-organizasyonu"),
            new Category("Fotoğrafçı", "fotografci"),
            new Category("Videographer", "videographer"),
            new Category("DJ", "dj"),
            new Category("Orkestra", "orkestra"),
            new Category("Gelinlik", "gelinlik"),
            new Category("Gelin Saçı", "gelin-saci"),
            new Category("Gelin Arabası", "gelin-arabasi"),
            new Category("Gelin Arabası Süsleme", "gelin-arabasi-susleme"),
            new Category("Çiçekçi", "cicekci"),
            new Category("Pasta", "pasta"),
            new Category("Catering", "catering"),
            new Category("Lokma Dağıtımı", "lokma-dagitimi"),
            new Category("Pilav Dağıtımı", "pilav-dagitimi")
        ];
    }
}