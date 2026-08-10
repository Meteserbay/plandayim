using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Plandayim.Domain.Businesses;

namespace Plandayim.Infrastructure.Persistence.Configurations;

public class BusinessInteractionConfiguration
    : IEntityTypeConfiguration<BusinessInteraction>
{
    public void Configure(EntityTypeBuilder<BusinessInteraction> builder)
    {
        builder.ToTable("BusinessInteractions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Type)
            .IsRequired();

        builder.HasIndex(x => new
        {
            x.BusinessId,
            x.Type,
            x.CreatedAtUtc
        });

        builder.HasOne<Business>()
            .WithMany()
            .HasForeignKey(x => x.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}