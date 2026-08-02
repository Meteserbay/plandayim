using Plandayim.Domain.Common;

namespace Plandayim.Domain.Categories;

public class Category : BaseEntity
{
    private Category()
    {
    }

    public Category(string name, string slug)
    {
        Name = name;
        Slug = slug;
        IsActive = true;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public string Name { get; private set; } = null!;

    public string Slug { get; private set; } = null!;

    public bool IsActive { get; private set; }
}