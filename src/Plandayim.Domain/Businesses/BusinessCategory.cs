namespace Plandayim.Domain.Businesses;

public class BusinessCategory
{
    private BusinessCategory()
    {
    }

    public BusinessCategory(
        long businessId,
        long categoryId,
        bool isPrimary = false)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(businessId);
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(categoryId);

        BusinessId = businessId;
        CategoryId = categoryId;
        IsPrimary = isPrimary;
    }

    public long BusinessId { get; private set; }

    public long CategoryId { get; private set; }

    public bool IsPrimary { get; private set; }

    public void SetAsPrimary()
    {
        IsPrimary = true;
    }

    public void RemoveAsPrimary()
    {
        IsPrimary = false;
    }
}