using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Plandayim.Domain.Businesses;

namespace Plandayim.Infrastructure.Persistence.Configurations;

public class BusinessCampaignConfiguration
    : IEntityTypeConfiguration<BusinessCampaign>
{
    public void Configure(EntityTypeBuilder<BusinessCampaign> builder)
    {
        builder.ToTable("BusinessCampaigns");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Description)
            .IsRequired()
            .HasMaxLength(1000);

        builder.HasIndex(x => new
        {
            x.BusinessId,
            x.Code
        })
        .IsUnique();

        builder.HasIndex(x => new
        {
            x.BusinessId,
            x.IsActive
        });

        builder.HasOne<Business>()
            .WithMany()
            .HasForeignKey(x => x.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}