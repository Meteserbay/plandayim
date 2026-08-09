using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Plandayim.Domain.Businesses;

namespace Plandayim.Infrastructure.Persistence.Configurations;

public class BusinessImageConfiguration
    : IEntityTypeConfiguration<BusinessImage>
{
    public void Configure(EntityTypeBuilder<BusinessImage> builder)
    {
        builder.ToTable("BusinessImages");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Url)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(x => x.AltText)
            .HasMaxLength(300);

        builder.HasIndex(x => new
        {
            x.BusinessId,
            x.SortOrder
        });

        builder.HasIndex(x => new
        {
            x.BusinessId,
            x.IsCover
        });

        builder.HasOne<Business>()
            .WithMany()
            .HasForeignKey(x => x.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}