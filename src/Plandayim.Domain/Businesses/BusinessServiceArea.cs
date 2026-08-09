namespace Plandayim.Domain.Businesses;

public class BusinessServiceArea
{
    private BusinessServiceArea()
    {
    }

    public BusinessServiceArea(long businessId, long districtId)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(businessId);
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(districtId);

        BusinessId = businessId;
        DistrictId = districtId;
    }

    public long BusinessId { get; private set; }

    public long DistrictId { get; private set; }
}