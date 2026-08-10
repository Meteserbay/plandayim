using Microsoft.EntityFrameworkCore;
using Plandayim.Domain.Businesses;
using Plandayim.Domain.Categories;
using Plandayim.Domain.Locations;

namespace Plandayim.Infrastructure.Persistence.Seed;

public static class BusinessSeeder
{
    public static void Seed(DbContext context)
    {
        if (context.Set<Business>().Any())
        {
            return;
        }

        var istanbul = context.Set<City>()
            .First(x => x.Name == "Ýstanbul");

        var pendik = context.Set<District>()
            .First(x => x.CityId == istanbul.Id && x.Name == "Pendik");

        var kartal = context.Set<District>()
            .First(x => x.CityId == istanbul.Id && x.Name == "Kartal");

        var tuzla = context.Set<District>()
            .First(x => x.CityId == istanbul.Id && x.Name == "Tuzla");

        var kadikoy = context.Set<District>()
            .First(x => x.CityId == istanbul.Id && x.Name == "Kadýköy");

        var lokmaCategory = context.Set<Category>()
            .First(x => x.Slug == "lokma-dagitimi");

        var photographerCategory = context.Set<Category>()
            .First(x => x.Slug == "fotografci");

        var organizationCategory = context.Set<Category>()
            .First(x => x.Slug == "dugun-organizasyonu");

        var lokmaci = new Business(
    "Örnek Lokma",
    "ornek-lokma",
    "05550000001",
    istanbul.Id,
    pendik.Id);

        lokmaci.UpdateContact(
            "05550000001",
            "905550000001",
            "ornek@plandayim.com",
            "https://example.com");

        var photographer = new Business(
            "Örnek Fotoðraf",
            "ornek-fotograf",
            "05550000002",
            istanbul.Id,
            kadikoy.Id);

        var organizer = new Business(
            "Örnek Organizasyon",
            "ornek-organizasyon",
            "05550000003",
            istanbul.Id,
            kartal.Id);

        context.Set<Business>().AddRange(
            lokmaci,
            photographer,
            organizer);

        context.SaveChanges();

        lokmaci.UpdateLogo(
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3");

        context.Set<BusinessImage>().AddRange(
            new BusinessImage(
                lokmaci.Id,
                "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
                "Örnek Lokma organizasyon görseli",
                1,
                true),

            new BusinessImage(
                lokmaci.Id,
                "https://images.unsplash.com/photo-1507504031003-b417219a0fde",
                "Lokma daðýtým organizasyonu",
                2),

            new BusinessImage(
                lokmaci.Id,
                "https://images.unsplash.com/photo-1511795409834-ef04bbd61622",
                "Etkinlik hizmeti",
                3)
        );


        context.Set<BusinessCategory>().AddRange(
            new BusinessCategory(
                lokmaci.Id,
                lokmaCategory.Id,
                true),

            new BusinessCategory(
                photographer.Id,
                photographerCategory.Id,
                true),

            new BusinessCategory(
                organizer.Id,
                organizationCategory.Id,
                true)
        );

        context.Set<BusinessServiceArea>().AddRange(
            new BusinessServiceArea(lokmaci.Id, pendik.Id),
            new BusinessServiceArea(lokmaci.Id, kartal.Id),
            new BusinessServiceArea(lokmaci.Id, tuzla.Id),

            new BusinessServiceArea(photographer.Id, kadikoy.Id),
            new BusinessServiceArea(photographer.Id, kartal.Id),

            new BusinessServiceArea(organizer.Id, kartal.Id),
            new BusinessServiceArea(organizer.Id, pendik.Id),
            new BusinessServiceArea(organizer.Id, tuzla.Id)
        );

        context.Set<BusinessCampaign>().Add(
            new BusinessCampaign(
                lokmaci.Id,
                "Plandayým'a Özel Ýndirim",
                "PLANDAYIM10",
                "Plandayým üzerinden gelen müþterilere özel avantaj.")
        );

        context.SaveChanges();
    }
}