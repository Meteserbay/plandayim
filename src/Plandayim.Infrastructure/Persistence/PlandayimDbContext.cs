using Microsoft.EntityFrameworkCore;
using Plandayim.Domain.Businesses;
using Plandayim.Domain.Categories;
using Plandayim.Domain.Locations;

namespace Plandayim.Infrastructure.Persistence;

public class PlandayimDbContext : DbContext
{
    public PlandayimDbContext(DbContextOptions<PlandayimDbContext> options)
        : base(options)
    {
    }

    public DbSet<Business> Businesses => Set<Business>();
    public DbSet<BusinessImage> BusinessImages => Set<BusinessImage>();
    public DbSet<BusinessCategory> BusinessCategories => Set<BusinessCategory>();

    public DbSet<BusinessServiceArea> BusinessServiceAreas => Set<BusinessServiceArea>();

    public DbSet<BusinessCampaign> BusinessCampaigns => Set<BusinessCampaign>();

    public DbSet<Category> Categories => Set<Category>();

    public DbSet<City> Cities => Set<City>();

    public DbSet<District> Districts => Set<District>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(PlandayimDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}