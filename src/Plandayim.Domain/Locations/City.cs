using Plandayim.Domain.Common;

namespace Plandayim.Domain.Locations;

public class City : BaseEntity
{
    private City()
    {
    }

    public City(string name)
    {
        Name = name;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public string Name { get; private set; } = null!;
}