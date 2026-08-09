using Microsoft.EntityFrameworkCore;
using Plandayim.Application.Categories;
using Plandayim.Infrastructure.Persistence;

namespace Plandayim.Infrastructure.Categories;

public sealed class CategoryService : ICategoryService
{
    private readonly PlandayimDbContext _dbContext;

    public CategoryService(PlandayimDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<CategoryDto>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Categories
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.Name)
            .Select(x => new CategoryDto(
                x.Id,
                x.Name,
                x.Slug))
            .ToListAsync(cancellationToken);
    }
}