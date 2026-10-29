using Plandayim.Domain.Common;

namespace Plandayim.Domain.Businesses;

public class BusinessInteraction : BaseEntity
{
    private BusinessInteraction()
    {
    }

    public BusinessInteraction(
        long businessId,
        BusinessInteractionType type)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(businessId);

        BusinessId = businessId;
        Type = type;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public long BusinessId { get; private set; }

    public BusinessInteractionType Type { get; private set; }
}