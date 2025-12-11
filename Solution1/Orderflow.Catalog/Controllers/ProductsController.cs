using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orderflow.Catalog.DTOs;
using Orderflow.Catalog.Services;

namespace Orderflow.Catalog.Controllers
{
    [ApiController]
    [Route("/api/v{version:apiVersion}/[controller]")]
    public class ProductsController(IProductService _productService, IStockService _stockService) : ControllerBase
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

        [HttpGet("GetProduct/{id:Guid}")]
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

        [HttpPatch("{id:Guid}/UpdateStock")]
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

        [HttpPatch("{id:Guid}/UpdatePrice")]
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

        [HttpPost("{id:Guid}/reserve")]
        public async Task<IActionResult> ReserveStock(Guid id, StockOperationRequest request)
        {
            var result = await _stockService.ReserveStockAsync(id, request.Stock);

            if (result.Success)
            {
                return Ok();
            }
            return BadRequest(result.ErrorMessage);
        }

        [HttpPost("{id:Guid}/release")]
        public async Task<IActionResult> ReleaseStock(Guid id, StockOperationRequest request)
        {
            var result = await _stockService.ReleaseStockAsync(id, request.Stock);

            if (result.Success)
            {
                return Ok();
            }

            return BadRequest(result.ErrorMessage);
        }
    }
}