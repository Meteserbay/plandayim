using Microsoft.AspNetCore.Mvc;
using Plandayim.Application.Categories;

namespace Plandayim.Api.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoryDto>>> GetAll(
        CancellationToken cancellationToken)
    {
        var categories =
            await _categoryService.GetAllAsync(cancellationToken);

        return Ok(categories);
    }
}