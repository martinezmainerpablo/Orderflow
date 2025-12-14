using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orderflow.Orders.Class;
using Orderflow.Orders.DTOs;
using Orderflow.Orders.Services;
using System.Security.Claims;

namespace Orderflow.Orders.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize(Roles = "User")]

    public class OrdersController(IOrderService orderService) : ControllerBase
    {
        private Guid GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
        }

        [HttpGet("GetAllOrders")]
        public async Task<ActionResult<IEnumerable<OrderListResponse>>> GetUserOrders()
        {
            var userId = GetUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("Invalid user token");
            }

            var result = await orderService.GetUserOrdersAsync(userId);

            if (!result.Success)
            {
                return BadRequest(result.ErrorMessage);
            }

            return Ok(result.Data);
        }

        [HttpGet("GetOrder/{orderId:guid}")]
        public async Task<ActionResult<OrderResponse>> GetOrderById(Guid orderId)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("Invalid user token");
            }

            var result = await orderService.GetOrderByIdAsync(orderId, userId);

            if (!result.Success)
            {
                return result.ErrorMessage == "Order not found"
                    ? NotFound(result.ErrorMessage)
                    : Forbid();
            }

            return Ok(result.Data);
        }

        [HttpPost("Create")]
        public async Task<ActionResult<OrderResponse>> CreateOrder(CreateOrderRequest request)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("Invalid user token");
            }

            var authHeader = Request.Headers.Authorization.FirstOrDefault();
            var token = authHeader?.Replace("Bearer ", "");

            var result = await orderService.CreateOrderAsync(userId, request, token);

            if (!result.Success)
            {
                if (result.Errors.Any(e => e.Contains("service unavailable")))
                    return StatusCode(503, string.Join(", ", result.Errors));
                    
                return BadRequest(string.Join(", ", result.Errors));
            }

            var locationUri = Url.Action(nameof(GetOrderById), new { orderId = result.Data.IdOrder });
            return Created(locationUri, result.Data);
        }

        [HttpPost("{orderId:guid}/cancel")]
        public async Task<IActionResult> CancelOrder(Guid orderId)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("Invalid user token");
            }

            var result = await orderService.CancelOrder(orderId, userId);

            return Ok(new
            {
                idOrder = orderId,
                status = "Cancelled",
                success = true,
                message = "Order cancelled successfully"
            }); 
        }
    }
}