using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orderflow.Catalog.DTOs;
using Orderflow.Catalog.Services;

namespace Orderflow.Catalog.Controllers
{
    [ApiController]
    [Route("/api/v{version:apiVersion}/[controller]")]
    public class ProductsController(IProductService _productService) : ControllerBase
    {

        [HttpGet("GetAll")]
        [Authorize(Roles = "Admin,User")]
        public async Task<ActionResult<IEnumerable<ProductListResponse>>> GetAllProducts()
        {
            var products = await _productService.GetAllAsync();
            if (!products.Any())
            {
                return NotFound("No hay productos disponibles.");
            }

            return Ok(products);
        }

        [HttpGet("GetProduct")]
        [Authorize(Roles = "Admin,User")]
        public async Task<ActionResult<ProductResponse>> GetProductById(Guid id)
        {

            var result = await _productService.GetByIdAsync(id);

            if (result is null) 
            {
                return NotFound("Producto no encontrado");
            }

            return Ok(result);
        }

        [HttpPost("Create")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProductResponse>> CreateProduct([FromBody] CreateProductRequest request)
        {

            var product = await _productService.CreateAsync(request);

            return Ok("Producto creado con exito");
        }

        [HttpPatch("UpdateStock")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UpdateStockResponse>> UpdateStock([FromBody] UpdateStockRequest request)
        {
            var result = await _productService.UpdateStockAsync(request);

            if (result is null)
            {
                return NotFound("Producto no encontrado");
            }

            return Ok(result);
        }

        [HttpPatch("UpdatePrice")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UpdatePriceResponse>> UpdatePrice([FromBody] UpdatePriceRequest request)
        {
            var result = await _productService.UpdatePriceAsync(request);

            if (result is null)
            {
                return NotFound("Producto no encontrado");
            }

            return Ok(result);
        }

        [HttpDelete("Delete")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteProduct(Guid id)
        {
            var isDeleted = await _productService.DeleteAsync(id);

            if (!isDeleted)
            {
                return NotFound("Producto no encontrado");
            }

           return  Ok("Producto eliminado con exito");
        }
    }
}