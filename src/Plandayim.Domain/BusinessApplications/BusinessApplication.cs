using Plandayim.Domain.Common;

namespace Plandayim.Domain.BusinessApplications;

public class BusinessApplication : BaseEntity
{
    private BusinessApplication()
    {
    }

    public BusinessApplication(
        string businessName,
        string contactName,
        string phoneNumber,
        string email,
        BusinessApplicationType type,
        long? businessId = null,
        string? message = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(businessName);
        ArgumentException.ThrowIfNullOrWhiteSpace(contactName);
        ArgumentException.ThrowIfNullOrWhiteSpace(phoneNumber);
        ArgumentException.ThrowIfNullOrWhiteSpace(email);

        if (type == BusinessApplicationType.ClaimBusiness &&
            !businessId.HasValue)
        {
            throw new ArgumentException(
                "Claim business applications require a BusinessId.");
        }

        BusinessName = businessName;
        ContactName = contactName;
        PhoneNumber = phoneNumber;
        Email = email;
        Type = type;
        BusinessId = businessId;
        Message = message;

        Status = BusinessApplicationStatus.Pending;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public long? BusinessId { get; private set; }

    public string BusinessName { get; private set; } = null!;

    public string ContactName { get; private set; } = null!;

    public string PhoneNumber { get; private set; } = null!;

    public string Email { get; private set; } = null!;

    public string? Message { get; private set; }

    public BusinessApplicationType Type { get; private set; }

    public BusinessApplicationStatus Status { get; private set; }

    public void Approve(long? createdBusinessId = null)
    {
        if (Status != BusinessApplicationStatus.Pending)
        {
            throw new InvalidOperationException(
                "Only pending applications can be approved.");
        }

        if (Type == BusinessApplicationType.AddBusiness)
        {
            if (!createdBusinessId.HasValue)
            {
                throw new ArgumentException(
                    "Approving an add business application requires the created BusinessId.");
            }

            BusinessId = createdBusinessId;
        }

        Status = BusinessApplicationStatus.Approved;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void Reject()
    {
        if (Status != BusinessApplicationStatus.Pending)
        {
            throw new InvalidOperationException(
                "Only pending applications can be rejected.");
        }

        Status = BusinessApplicationStatus.Rejected;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}