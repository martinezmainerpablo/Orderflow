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

        /// <summary>
        /// Obtiene el GUID del usuario a partir de los Claims de autenticación.
        /// </summary>
        private ActionResult<Guid> GetUserIdFromClaims()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

            if (string.IsNullOrEmpty(userIdString))
                return Unauthorized(); // 401 Unauthorized

            if (!Guid.TryParse(userIdString, out Guid userIdGuid))
            {
                // Este caso es inusual si la autenticación está configurada correctamente.
                return BadRequest("El identificador de usuario en los claims no tiene el formato correcto."); // 400 Bad Request
            }

            return userIdGuid;
        }

        // --- Endpoints de Consulta ---

        /// <summary>
        /// Obtiene una lista de todas las órdenes del usuario autenticado.
        /// GET api/v1/Order
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<OrderListResponse>), 200)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<IEnumerable<OrderListResponse>>> GetUserOrders()
        {
            var userIdResult = GetUserIdFromClaims();
            if (userIdResult.Result is ActionResult result)
            {
                return result;
            }
            var userId = userIdResult.Value;

            var orders = await orderService.GetUserOrdersAsync(userId);

            // El servicio GetUserOrdersAsync devuelve directamente el DTO
            return Ok(orders); // 200 OK
        }

        // ---

        /// <summary>
        /// Obtiene los detalles de una orden específica.
        /// GET api/v1/Order/{id}
        /// </summary>
        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(OrderResponse), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<OrderResponse>> GetOrderById(Guid id)
        {
            var userIdResult = GetUserIdFromClaims();
            if (userIdResult.Result is ActionResult result)
            {
                return result;
            }
            var userId = userIdResult.Value;

            // El servicio GetOrderByIdAsync devuelve 'null' si la orden no existe o no pertenece al usuario.
            var order = await orderService.GetOrderByIdAsync(id, userId);

            if (order is null)
            {
                return NotFound($"Order with ID {id} not found or access denied."); // 404 Not Found
            }

            // El servicio GetOrderByIdAsync devuelve el DTO mapeado.
            return Ok(order); // 200 OK
        }

        // --- Endpoints de Comando ---

        /// <summary>
        /// Crea una nueva orden para el usuario autenticado.
        /// POST api/v1/Order
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(OrderResponse), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
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
                // El servicio ya devuelve un mensaje de error si falla (ej. stock insuficiente, item inválido).
                return BadRequest(orderResult.Message); // 400 Bad Request
            }

            // 201 Created (usando el DTO de respuesta para devolver los datos creados)
            return CreatedAtAction(nameof(GetOrderById), new { id = orderResult.Id }, orderResult);
        }

        // ---

        /// <summary>
        /// Cancela una orden existente.
        /// PUT api/v1/Order/{id}/cancel
        /// </summary>
        [HttpPut("{id:guid}/cancel")]
        [ProducesResponseType(204)] // No Content para una cancelación exitosa
        [ProducesResponseType(400)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> CancelOrder(Guid id)
        {
            var userIdResult = GetUserIdFromClaims();
            if (userIdResult.Result is ActionResult result)
            {
                return result;
            }
            var userId = userIdResult.Value;

            // El servicio CancelOrder devuelve IActionResult, por lo que podemos retornar el resultado directamente.
            var actionResult = await orderService.CancelOrder(id, userId);

            // Si el resultado es una instancia de ForbidResult (403), NotFoundObjectResult (404), o BadRequestObjectResult (400)
            // lo devolvemos directamente.
            if (actionResult is ForbidResult || actionResult is NotFoundObjectResult || actionResult is BadRequestObjectResult)
            {
                return actionResult;
            }

            // Si es OkObjectResult, asumimos que la operación fue exitosa. 
            // Para una cancelación, normalmente devolvemos 204 No Content.
            return NoContent(); // 204 No Content
        }
    }
}