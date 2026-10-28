using Microsoft.EntityFrameworkCore;
using Plandayim.Application.BusinessApplications;
using Plandayim.Domain.BusinessApplications;
using Plandayim.Infrastructure.Persistence;

namespace Plandayim.Infrastructure.BusinessApplications;

public sealed class BusinessApplicationService
    : IBusinessApplicationService
{
    private readonly PlandayimDbContext _dbContext;

    public BusinessApplicationService(PlandayimDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<long> CreateAsync(
        CreateBusinessApplicationRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Type == BusinessApplicationType.ClaimBusiness)
        {
            if (!request.BusinessId.HasValue)
            {
                throw new ArgumentException(
                    "Claim business applications require a BusinessId.");
            }

            var businessExists = await _dbContext.Businesses
                .AsNoTracking()
                .AnyAsync(
                    x => x.Id == request.BusinessId && x.IsActive,
                    cancellationToken);

            if (!businessExists)
            {
                throw new KeyNotFoundException("Business not found.");
            }
        }

        var businessId = request.Type == BusinessApplicationType.ClaimBusiness
            ? request.BusinessId
            : null;

        var application = new BusinessApplication(
            request.BusinessName.Trim(),
            request.ContactName.Trim(),
            request.PhoneNumber.Trim(),
            request.Email.Trim(),
            request.Type,
            businessId,
            string.IsNullOrWhiteSpace(request.Message)
                ? null
                : request.Message.Trim());

        _dbContext.BusinessApplications.Add(application);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return application.Id;
    }
}