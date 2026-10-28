using Plandayim.Domain.BusinessApplications;

namespace Plandayim.Application.BusinessApplications;

public sealed record BusinessApplicationDto(
    long Id,
    BusinessApplicationType Type,
    BusinessApplicationStatus Status,
    long? BusinessId,
    string? BusinessSlug,
    string BusinessName,
    string ContactName,
    string PhoneNumber,
    string Email,
    string? Message,
    long? ApplicantUserId,
    string? ApplicantEmail,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);
