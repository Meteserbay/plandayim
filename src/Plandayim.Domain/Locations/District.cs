using Plandayim.Domain.Common;

namespace Plandayim.Domain.Locations;

public class District : BaseEntity
{
    private District()
    {
    }

    public District(string name, long cityId)
    {
        Name = name;
        CityId = cityId;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public string Name { get; private set; } = null!;

    public long CityId { get; private set; }
}