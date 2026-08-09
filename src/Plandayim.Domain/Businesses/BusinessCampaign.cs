using Plandayim.Domain.Common;

namespace Plandayim.Domain.Businesses;

public class BusinessCampaign : BaseEntity
{
    private BusinessCampaign()
    {
    }

    public BusinessCampaign(
        long businessId,
        string title,
        string code,
        string description)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(businessId);
        ArgumentException.ThrowIfNullOrWhiteSpace(title);
        ArgumentException.ThrowIfNullOrWhiteSpace(code);
        ArgumentException.ThrowIfNullOrWhiteSpace(description);

        BusinessId = businessId;
        Title = title;
        Code = code;
        Description = description;
        IsActive = true;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public long BusinessId { get; private set; }

    public string Title { get; private set; } = null!;

    public string Code { get; private set; } = null!;

    public string Description { get; private set; } = null!;

    public DateTime? StartsAtUtc { get; private set; }

    public DateTime? EndsAtUtc { get; private set; }

    public bool IsActive { get; private set; }

    public void Update(
        string title,
        string code,
        string description,
        DateTime? startsAtUtc,
        DateTime? endsAtUtc)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(title);
        ArgumentException.ThrowIfNullOrWhiteSpace(code);
        ArgumentException.ThrowIfNullOrWhiteSpace(description);

        if (startsAtUtc.HasValue &&
            endsAtUtc.HasValue &&
            endsAtUtc <= startsAtUtc)
        {
            throw new ArgumentException(
                "Campaign end date must be later than start date.");
        }

        Title = title;
        Code = code;
        Description = description;
        StartsAtUtc = startsAtUtc;
        EndsAtUtc = endsAtUtc;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}