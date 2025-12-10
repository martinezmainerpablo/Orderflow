using Microsoft.AspNetCore.Mvc;
using Orderflow.Orders.DTOs;
using Orderflow.Orders.Services;
using System.Security.Claims;

namespace Orderflow.Orders.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]

    public class OrdersController(IOrderService orderService) : ControllerBase
    {
        private ActionResult<Guid> GetUserIdFromClaims()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

            if (string.IsNullOrEmpty(userIdString))
                return Unauthorized();

            if (!Guid.TryParse(userIdString, out Guid userIdGuid))
            {
                return BadRequest("El identificador de usuario en los claims no tiene el formato correcto."); 
            }

            return userIdGuid;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderListResponse>>> GetUserOrders()
        {
            var userIdResult = GetUserIdFromClaims();
            if (userIdResult.Result is ActionResult result)
            {
                return result;
            }
            var userId = userIdResult.Value;

            var orders = await orderService.GetUserOrdersAsync(userId);

            return Ok(orders); 
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<OrderResponse>> GetOrderById(Guid id)
        {
            var userIdResult = GetUserIdFromClaims();
            if (userIdResult.Result is ActionResult result)
            {
                return result;
            }
            var userId = userIdResult.Value;

            var order = await orderService.GetOrderByIdAsync(id, userId);

            if (order is null)
            {
                return NotFound($"Order with ID {id} not found or access denied."); 
            }

            return Ok(order); 
        }

        [HttpPost]
        public async Task<ActionResult<OrderResponse>> CreateOrder(CreateOrderRequest request)
        {
            var userIdResult = GetUserIdFromClaims();
            if (userIdResult.Result is ActionResult result)
            {
                return result;
            }
            var userId = userIdResult.Value;

            var orderResult = await orderService.CreateOrderAsync(userId, request);

            if (!orderResult.IsSuccess)
            {
                return BadRequest(orderResult.Message); 
            }

            return CreatedAtAction(nameof(GetOrderById), new { id = orderResult.Id }, orderResult);
        }

        [HttpPut("{id:guid}/cancel")]
        public async Task<IActionResult> CancelOrder(Guid id)
        {
            var userIdResult = GetUserIdFromClaims();
            if (userIdResult.Result is ActionResult result)
            {
                return result;
            }
            var userId = userIdResult.Value;

            var actionResult = await orderService.CancelOrder(id, userId);

            if (actionResult is ForbidResult || actionResult is NotFoundObjectResult || actionResult is BadRequestObjectResult)
            {
                return actionResult;
            }
            return NoContent(); 
        }
    }
}