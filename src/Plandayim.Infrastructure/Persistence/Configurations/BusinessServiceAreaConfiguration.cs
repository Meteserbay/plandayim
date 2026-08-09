using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Plandayim.Domain.Businesses;
using Plandayim.Domain.Locations;

namespace Plandayim.Infrastructure.Persistence.Configurations;

public class BusinessServiceAreaConfiguration
    : IEntityTypeConfiguration<BusinessServiceArea>
{
    public void Configure(EntityTypeBuilder<BusinessServiceArea> builder)
    {
        builder.ToTable("BusinessServiceAreas");

        builder.HasKey(x => new
        {
            x.BusinessId,
            x.DistrictId
        });

        builder.HasOne<Business>()
            .WithMany()
            .HasForeignKey(x => x.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<District>()
            .WithMany()
            .HasForeignKey(x => x.DistrictId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.DistrictId);
    }
}