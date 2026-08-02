namespace Plandayim.Domain.Common;

public abstract class BaseEntity
{
    public long Id { get; protected set; }

    public DateTime CreatedAtUtc { get; protected set; }

    public DateTime? UpdatedAtUtc { get; protected set; }
}