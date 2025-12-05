using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orderflow.Catalog.DTOs;
using Orderflow.Catalog.Services;

namespace Orderflow.Catalog.Controllers
{
    [ApiController]
    [Route("/api/v{version:apiVersion}/[controller]")]
    [Authorize(Roles = "Admin")]
    public class CategoriesController(ICategoryService categoryService) : ControllerBase
    {
        [HttpGet("GetAllCategory")]
        public async Task<ActionResult<IEnumerable<CategoryResponse>>> GetAll()
        {
            var result = await categoryService.GetAllAsync();
            if(!result.Any())
            {
                return NotFound("No hay categorias disponibles");
            }
            return Ok(result);
        }

        [HttpGet("GetCategory")]
        public async Task<ActionResult<CategoryResponse>> GetById(Guid id)
        {
            var category = await categoryService.GetByIdAsync(id);

            if (category is null)
            {               
                return NotFound("Categoria no encontrada");
            }

            return Ok(category);
        }
        
        [HttpPost("CreateCategory")]
        public async Task<ActionResult<CategoryResponse>> Create(CreateCategoryRequest request)
        {
            var result = await categoryService.CreateAsync(request);

            return Ok("Categoria creada con exito");
        }


        [HttpDelete("DeleteCategory")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await categoryService.DeleteAsync(id);

            if (!result)
            {
                
                return NotFound("Categoria no encontrada");
            }

            return Ok("Categoria borrada");
        }
    }
}
