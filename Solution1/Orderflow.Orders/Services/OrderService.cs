using MassTransit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Orderflow.Orders.Data;
using Orderflow.Orders.DTOs;
using Orderflow.Orders.Class;


namespace Orderflow.Orders.Services
{
    public class OrderService(OrdersDbContext db,
        IHttpClientFactory httpClientFactory,
        ILogger<OrderService> logger) : IOrderService
    {
        private record ProductInfo(int Id, string Name, decimal Price, int Stock, bool IsActive);


        public async Task<IEnumerable<OrderListResponse>> GetUserOrdersAsync(Guid userId)
        {
            var ordersData = await db.Orders
               .Where(o => o.UserId == userId)
               .OrderByDescending(o => o.CreatedAt)
               .Select(o => new
               {
                   o.IdOrder,
                   o.Status,
                   o.TotalAmount,
                   ItemCount = o.Items.Count(),
                   o.CreatedAt
               })
               .ToListAsync();

            var response = ordersData.Select(o => new OrderListResponse(
                o.IdOrder,
                o.Status.ToString(),
                o.TotalAmount,
                o.ItemCount,
                o.CreatedAt));

            return response;
        }

        public async Task<OrderResponse> GetOrderByIdAsync(Guid orderId, Guid userId)
        {
            var order = await db.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.IdOrder == orderId);

            if (order is null)
            {
                return null;
            }

            if (order.UserId != userId)
            {
                return null;
            }

            return MapToResponse(order);
        }

        public async Task<OrderResponse> CreateOrderAsync(Guid userId, CreateOrderRequest request)
        {
            if (request?.Items == null || !request.Items.Any())
            {
                return OrderResponse.Failure("Order must have at least one item.");
            }

            var catalogClient = httpClientFactory.CreateClient("catalog");
            var orderItems = new List<OrderItem>();
            var reservedItems = new List<(Guid ProductId, int Quantity)>();

            foreach (var item in request.Items)
            {
                ProductInfo product;

                try
                {
                    var response = await catalogClient.GetAsync($"/api/v1/products/{item.ProductId}");

                    if (!response.IsSuccessStatusCode)
                    {
                        await ReleaseReservedStockAsync(catalogClient, reservedItems);
                        return OrderResponse.Failure($"Product {item.ProductId} not found");
                    }


                    product = await response.Content.ReadFromJsonAsync<ProductInfo>()
                        ?? throw new InvalidOperationException($"Could not deserialize product {item.ProductId}.");

                    if (!product.IsActive)
                    {
                        await ReleaseReservedStockAsync(catalogClient, reservedItems);
                        return OrderResponse.Failure($"Product {product.Name} is not available");
                    }

                    var reserveResponse = await catalogClient.PostAsJsonAsync(
                        $"/api/v1/products/{item.ProductId}/reserve",
                        new { Units = item.Units }); 

                    if (!reserveResponse.IsSuccessStatusCode)
                    {
                        await ReleaseReservedStockAsync(catalogClient, reservedItems);
                        var error = await reserveResponse.Content.ReadAsStringAsync();
                        return OrderResponse.Failure(
                            reserveResponse.StatusCode == System.Net.HttpStatusCode.Conflict
                                ? $"Insufficient stock for {product.Name}"
                                : $"Failed to reserve stock for {product.Name}: {error}");
                    }

                    reservedItems.Add((item.ProductId, item.Units));

                    orderItems.Add(new OrderItem
                    {
                        ProductId = item.ProductId,
                        ProductName = product.Name,
                        UnitPrice = product.Price,
                        Units = item.Units
                    });
                }
                catch (HttpRequestException ex)
                {
                    logger.LogError(ex, "Catalog service unavailable");
                    await ReleaseReservedStockAsync(catalogClient, reservedItems);
                    return OrderResponse.Failure("Catalog service unavailable");
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "An unexpected error occurred during order creation.");
                    await ReleaseReservedStockAsync(catalogClient, reservedItems);
                    return OrderResponse.Failure("An unexpected error occurred.");
                }
            }

            var order = new Order
            {
                UserId = userId,
                ShippingAddress = request.ShippingAddress,
                Notes = request.Notes,
                Items = orderItems,
                TotalAmount = orderItems.Sum(i => i.UnitPrice * i.Units)
            };

            db.Orders.Add(order);
            await db.SaveChangesAsync();

            logger.LogInformation("Order created: {OrderId} for user {UserId}", order.IdOrder, userId);

            return OrderResponse.Success(MapToResponse(order));
        }

        public async Task<IActionResult> CancelOrder(Guid orderId, Guid userId)
        {
            var order = await db.Orders
                .FirstOrDefaultAsync(o => o.IdOrder == orderId);

            if (order is null) return new NotFoundObjectResult("Order not found.");
            if (order.UserId != userId) return new ForbidResult();

            if (order.Status != OrderStatus.Pending && order.Status != OrderStatus.Confirmed)
            {
                return new BadRequestObjectResult($"Order cannot be cancelled. Current status is {order.Status}.");
            }

            order.Status = OrderStatus.Cancelled;
            order.UpdatedAt = DateTime.UtcNow;

            db.Orders.Update(order);
            await db.SaveChangesAsync();

            logger.LogInformation("Order {OrderId} cancelled by user {UserId}.", orderId, userId);

            // Devolver IActionResult con el DTO mapeado
            return new OkObjectResult(MapToResponse(order));
        }

        public async Task<IEnumerable<OrderListResponse>> GetAllOrdersAsync(OrderStatus? status, Guid? userId)
        {
            var query = db.Orders.AsQueryable();

            if (status.HasValue) query = query.Where(o => o.Status == status.Value);

            // Asumiendo que userId es un filtro obligatorio para el administrador
            query = query.Where(o => o.UserId == userId);

            var ordersData = await query
                 .OrderByDescending(o => o.CreatedAt)
                 .Select(o => new
                 {
                     o.IdOrder,
                     o.Status,
                     o.TotalAmount,
                     ItemCount = o.Items.Count(),
                     o.CreatedAt
                 })
                 .ToListAsync();

            return ordersData.Select(o => new OrderListResponse(
                o.IdOrder, o.Status.ToString(), o.TotalAmount, o.ItemCount, o.CreatedAt));
        }

        public async Task<OrderResponse> GetByIdForAdminAsync(Guid id)
        {
            var order = await db.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.IdOrder == id);

            if (order is null)
            {
                return OrderResponse.Failure("Order not found");
            }

            return OrderResponse.Success(MapToResponse(order));
        }

        public async Task<OrderResponse> UpdateStatusAsync(Guid id, OrderStatus newStatus)
        {
            var order = await db.Orders.FirstOrDefaultAsync(o => o.IdOrder == id);

            if (order is null)
            {
                return OrderResponse.Failure("Order not found");
            }

            if (!IsValidStatusTransition(order.Status, newStatus))
            {
                var msg = $"Cannot transition from {order.Status} to {newStatus}";
                return OrderResponse.Failure(msg); 
            }

            // 3. Éxito
            order.Status = newStatus;
            order.UpdatedAt = DateTime.UtcNow;

            await db.SaveChangesAsync();

            logger.LogInformation("Order status updated: {OrderId} -> {Status}", id, newStatus);

            var mappedData = MapToResponse(order);
            return OrderResponse.Success(mappedData); 
        }

        private static bool IsValidStatusTransition(OrderStatus current, OrderStatus next)
        {
            return (current, next) switch
            {
                (OrderStatus.Pending, OrderStatus.Confirmed) => true,
                (OrderStatus.Pending, OrderStatus.Cancelled) => true,
                (OrderStatus.Confirmed, OrderStatus.Processing) => true,
                (OrderStatus.Confirmed, OrderStatus.Cancelled) => true,
                (OrderStatus.Processing, OrderStatus.Shipped) => true,
                (OrderStatus.Shipped, OrderStatus.Delivered) => true,
                _ => false
            };
        }


        private async Task ReleaseReservedStockAsync(HttpClient catalogClient, List<(Guid ProductId, int Quantity)> reservedItems)
        {
            foreach (var (productId, quantity) in reservedItems)
            {
                try
                {
                    await catalogClient.PostAsJsonAsync(
                        $"/api/v1/products/{productId}/release",
                        new { Quantity = quantity });
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Failed to release reserved stock for product {ProductId}", productId);
                }
            }
        }

        private static OrderResponse MapToResponse(Order order) => new(
            order.IdOrder,
            order.UserId,
            order.Status.ToString(),
            order.TotalAmount,
            order.ShippingAddress,
            order.Notes,
            order.CreatedAt,
            order.UpdatedAt,
            order.Items.Select(i => new OrderItemResponse(
                i.Id, i.ProductId, i.ProductName, i.UnitPrice, i.Units, i.Total)));

    }
}