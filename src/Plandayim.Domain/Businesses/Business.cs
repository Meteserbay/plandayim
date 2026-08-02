using Plandayim.Domain.Common;

namespace Plandayim.Domain.Businesses;

public class Business : BaseEntity
{
    private Business()
    {
    }

    public Business(
        string name,
        string slug,
        string phoneNumber,
        long cityId,
        long districtId)
    {
        Name = name;
        Slug = slug;
        PhoneNumber = phoneNumber;
        CityId = cityId;
        DistrictId = districtId;
        IsActive = true;
        IsVerified = false;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public string Name { get; private set; } = null!;

    public string Slug { get; private set; } = null!;

    public string? Description { get; private set; }

    public string PhoneNumber { get; private set; } = null!;

    public string? WhatsAppNumber { get; private set; }

    public string? Email { get; private set; }

    public string? WebsiteUrl { get; private set; }

    public string? Address { get; private set; }

    public long CityId { get; private set; }

    public long DistrictId { get; private set; }

    public decimal? Latitude { get; private set; }

    public decimal? Longitude { get; private set; }

    public bool IsVerified { get; private set; }

    public bool IsActive { get; private set; }
}