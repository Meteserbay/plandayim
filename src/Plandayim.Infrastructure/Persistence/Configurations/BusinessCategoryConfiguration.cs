using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Plandayim.Domain.Businesses;
using Plandayim.Domain.Categories;

namespace Plandayim.Infrastructure.Persistence.Configurations;

public class BusinessCategoryConfiguration
    : IEntityTypeConfiguration<BusinessCategory>
{
    public void Configure(EntityTypeBuilder<BusinessCategory> builder)
    {
        builder.ToTable("BusinessCategories");

        builder.HasKey(x => new
        {
            x.BusinessId,
            x.CategoryId
        });

        builder.HasOne<Business>()
            .WithMany()
            .HasForeignKey(x => x.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<Category>()
            .WithMany()
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.CategoryId);

        builder.HasIndex(x => new
        {
            x.BusinessId,
            x.IsPrimary
        });
    }
}