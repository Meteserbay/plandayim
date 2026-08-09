using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Plandayim.Domain.Categories;

namespace Plandayim.Infrastructure.Persistence.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("Categories");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(x => x.Slug)
            .IsRequired()
            .HasMaxLength(170);

        builder.HasIndex(x => x.Slug)
            .IsUnique();

        builder.HasIndex(x => x.Name);
    }
}