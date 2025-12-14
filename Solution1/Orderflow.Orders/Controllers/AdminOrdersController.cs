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
        [HttpGet("GetAllOrders")]
        public async Task<ActionResult<IEnumerable<OrderListResponse>>> GetAll(
            [FromQuery] OrderStatus? status = null,
            [FromQuery] Guid? userId = null)
        {
            var result = await orderService.GetAllOrdersAsync(status, userId);
            return Ok(result.Data);
        }

        [HttpGet("{id:Guid}")]
        public async Task<ActionResult<OrderResponse>> GetById(Guid id)
        {
            var result = await orderService.GetByIdForAdminAsync(id);

            if (result == null)
                return NotFound();

            return Ok(result.Data);
        }

        [HttpPut("{id:guid}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, UpdateOrderStatusRequest request)
        {
            var result = await orderService.UpdateStatusAsync(id, request.Status);

            if (!result.Success)
            {
                if (result.Errors.Any(e => e.Contains("not found")))
                    return NotFound();

                return BadRequest(string.Join(", ", result.Errors));
            }

            return NoContent();
        }
    }
}
