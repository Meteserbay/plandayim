namespace Plandayim.Application.Categories;

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryDto>> GetAllAsync(
        CancellationToken cancellationToken = default);
}