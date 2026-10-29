namespace Plandayim.Application.BusinessApplications;

public interface IBusinessApplicationService
{
    Task<long> CreateAsync(
        CreateBusinessApplicationRequest request,
        CancellationToken cancellationToken = default);
}