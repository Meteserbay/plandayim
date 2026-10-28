using Plandayim.Domain.BusinessApplications;

namespace Plandayim.Application.BusinessApplications;

public interface IBusinessApplicationService
{
    Task<long> CreateAsync(
        CreateBusinessApplicationRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<BusinessApplicationDto>> ListAsync(
        BusinessApplicationStatus? status,
        CancellationToken cancellationToken = default);

    Task<BusinessApplicationDto> ApproveAsync(
        long applicationId,
        ApproveBusinessApplicationRequest request,
        CancellationToken cancellationToken = default);

    Task<BusinessApplicationDto> RejectAsync(
        long applicationId,
        CancellationToken cancellationToken = default);
}
