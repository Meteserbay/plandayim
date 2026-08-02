using Plandayim.Domain.Common;

namespace Plandayim.Domain.Businesses;

public class BusinessCategory : BaseEntity
{
    private BusinessCategory()
    {
    }

    public BusinessCategory(long businessId, long categoryId, bool isPrimary = false)
    {
        BusinessId = businessId;
        CategoryId = categoryId;
        IsPrimary = isPrimary;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public long BusinessId { get; private set; }

    public long CategoryId { get; private set; }

    public bool IsPrimary { get; private set; }
}