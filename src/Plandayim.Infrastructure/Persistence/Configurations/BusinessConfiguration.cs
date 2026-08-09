using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Plandayim.Domain.Businesses;
using Plandayim.Domain.Locations;
namespace Plandayim.Infrastructure.Persistence.Configurations;

public class BusinessConfiguration : IEntityTypeConfiguration<Business>
{
    public void Configure(EntityTypeBuilder<Business> builder)
    {
        builder.ToTable("Businesses");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Slug)
            .IsRequired()
            .HasMaxLength(220);

        builder.HasIndex(x => x.Slug)
            .IsUnique();

        builder.Property(x => x.Description)
            .HasMaxLength(2000);

        builder.Property(x => x.PhoneNumber)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(x => x.WhatsAppNumber)
            .HasMaxLength(30);

        builder.Property(x => x.Email)
            .HasMaxLength(254);

        builder.Property(x => x.WebsiteUrl)
            .HasMaxLength(500);

        builder.Property(x => x.Address)
            .HasMaxLength(500);

        builder.Property(x => x.Latitude)
            .HasPrecision(9, 6);

        builder.Property(x => x.Longitude)
            .HasPrecision(9, 6);

        builder.HasIndex(x => x.CityId);

        builder.HasIndex(x => x.DistrictId);

        builder.HasIndex(x => x.IsActive);

        builder.HasOne<City>()
    .WithMany()
    .HasForeignKey(x => x.CityId)
    .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<District>()
            .WithMany()
            .HasForeignKey(x => x.DistrictId)
            .OnDelete(DeleteBehavior.Restrict);
    }


}