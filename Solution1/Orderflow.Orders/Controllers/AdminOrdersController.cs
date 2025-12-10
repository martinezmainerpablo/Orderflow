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

            if (result == null)
            {
                return StatusCode(500, "Error interno: El servicio de órdenes devolvió un resultado nulo.");
            }

            if (!result.IsSuccess)
            {
                if (result.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
                {
                    return NotFound(); 
                }

                return BadRequest(result.Message);
            }

            return Ok("Estado actualizado");
        }
    }
}
