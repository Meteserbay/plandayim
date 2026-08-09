using Plandayim.Domain.Common;

namespace Plandayim.Domain.Businesses;

public class BusinessImage : BaseEntity
{
    private BusinessImage()
    {
    }

    public BusinessImage(
        long businessId,
        string url,
        string? altText,
        int sortOrder = 0,
        bool isCover = false)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(businessId);
        ArgumentException.ThrowIfNullOrWhiteSpace(url);

        if (sortOrder < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(sortOrder));
        }

        BusinessId = businessId;
        Url = url;
        AltText = altText;
        SortOrder = sortOrder;
        IsCover = isCover;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public long BusinessId { get; private set; }

    public string Url { get; private set; } = null!;

    public string? AltText { get; private set; }

    public int SortOrder { get; private set; }

    public bool IsCover { get; private set; }

    public void Update(string url, string? altText, int sortOrder)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(url);

        if (sortOrder < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(sortOrder));
        }

        Url = url;
        AltText = altText;
        SortOrder = sortOrder;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void SetAsCover()
    {
        IsCover = true;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void RemoveAsCover()
    {
        IsCover = false;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}