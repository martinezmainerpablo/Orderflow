using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orderflow.Orders.Class;
using Orderflow.Orders.DTOs;
using Orderflow.Orders.Services;

namespace Orderflow.Orders.Controllers
{
    [ApiController]
    [Route("api/v1/admin/orders")]
    [Authorize(Roles ="Admin")]
    public class AdminOrdersController(IOrderService orderService) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderListResponse>>> GetAll(
            [FromQuery] OrderStatus? status = null,
            [FromQuery] Guid? userId = null)
        {
            var result = await orderService.GetAllOrdersAsync(status, userId);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<OrderResponse>> GetById(Guid id)
        {
            var result = await orderService.GetByIdForAdminAsync(id);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPut("{id:guid}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, UpdateOrderStatusRequest request)
        {
            var result = await orderService.UpdateStatusAsync(id, request.Status);

            // 1. Manejo de nulo (Defensa, aunque raro en Task<T>)
            if (result == null)
            {
                return StatusCode(500, "Error interno: El servicio de órdenes devolvió un resultado nulo.");
            }

            // 2. Evaluación de Fallo
            if (!result.IsSuccess)
            {
                // 3. Inspección del Mensaje para el 404
                if (result.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
                {
                    return NotFound(); // Retorna 404
                }

                // 4. Retorno de Error General (400 Bad Request)
                // Usamos result.Message directamente
                return BadRequest(result.Message);
            }

            // 5. Éxito
            return NoContent(); // 204 No Content, estándar para actualizaciones
        }
    }
}
