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
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(slug);
        ArgumentException.ThrowIfNullOrWhiteSpace(phoneNumber);

        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(cityId);
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(districtId);

        Name = name;
        Slug = slug;
        PhoneNumber = phoneNumber;
        CityId = cityId;
        DistrictId = districtId;
        IsActive = true;
        IsVerified = false;
        CreatedAtUtc = DateTime.UtcNow;
    }

    // Properties

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

    // Domain Methods

    public void UpdateDetails(
    string name,
    string slug,
    string? description)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(slug);

        Name = name;
        Slug = slug;
        Description = description;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateContact(
    string phoneNumber,
    string? whatsAppNumber,
    string? email,
    string? websiteUrl)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(phoneNumber);

        PhoneNumber = phoneNumber;
        WhatsAppNumber = whatsAppNumber;
        Email = email;
        WebsiteUrl = websiteUrl;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateLocation(
    long cityId,
    long districtId,
    string? address,
    decimal? latitude,
    decimal? longitude)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(cityId);
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(districtId);

        CityId = cityId;
        DistrictId = districtId;
        Address = address;
        Latitude = latitude;
        Longitude = longitude;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void Verify()
    {
        IsVerified = true;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}