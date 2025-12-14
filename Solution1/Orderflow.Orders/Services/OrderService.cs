using MassTransit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Orderflow.Orders.Class;
using Orderflow.Orders.Data;
using Orderflow.Orders.DTOs;
using Orderflow.Shared;
using Orderflow.Shared.Events;


namespace Orderflow.Orders.Services
{
    public class OrderService(OrdersDbContext db,
        IHttpClientFactory httpClientFactory,
        IPublishEndpoint publishEndpoint,
        ILogger<OrderService> logger) : IOrderService
    {
        private record ProductInfo(Guid Id, string Name, decimal Price, int Stock, bool IsActive);


        public async Task<ServiceResult<IEnumerable<OrderListResponse>>> GetUserOrdersAsync(Guid userId)
        {
            var orders = await db.Orders
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new OrderListResponse(
                    o.IdOrder, o.Status.ToString(), o.TotalAmount, o.Items.Count, o.CreatedAt))
                .ToListAsync();

            return ServiceResult<IEnumerable<OrderListResponse>>.SuccessResult(orders);
        }

        public async Task<ServiceResult<OrderResponse>> GetOrderByIdAsync(Guid orderId, Guid userId)
        {
            var order = await db.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.IdOrder == orderId);

            if (order is null)
            {
                return ServiceResult<OrderResponse>.Failure("Order not found");
            }

            if (order.UserId != userId)
            {
                return ServiceResult<OrderResponse>.Failure("Access denied");
            }

            return ServiceResult<OrderResponse>.SuccessResult(MapToResponse(order));
        }

        public async Task<ServiceResult<OrderResponse>> CreateOrderAsync(Guid userId, CreateOrderRequest request, string? authorizationToken = null)
        {
            if (request?.Items == null || !request.Items.Any())
            {
                return ServiceResult<OrderResponse>.Failure("Order must have at least one item");
            }

            var catalogClient = httpClientFactory.CreateClient("catalog");

            // Agregar el token de autorización si existe
            if (!string.IsNullOrEmpty(authorizationToken))
            {
                catalogClient.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", authorizationToken);
            }

            var orderItems = new List<OrderItem>();
            var reservedItems = new List<(Guid ProductId, int Quantity)>();

            foreach (var item in request.Items)
            {
                try
                {
                    var response = await catalogClient.GetAsync($"/api/v1/products/getproduct/{item.ProductId}");

                    if (!response.IsSuccessStatusCode)
                    {
                        await ReleaseReservedStockAsync(catalogClient, reservedItems);
                        return ServiceResult<OrderResponse>.Failure($"Product {item.ProductId} not found");
                    }

                    var product = await response.Content.ReadFromJsonAsync<ProductInfo>();
                    if (product is null)
                    {
                        await ReleaseReservedStockAsync(catalogClient, reservedItems);
                        return ServiceResult<OrderResponse>.Failure($"Could not fetch product {item.ProductId}");
                    }

                    if (!product.IsActive)
                    {
                        await ReleaseReservedStockAsync(catalogClient, reservedItems);
                        return ServiceResult<OrderResponse>.Failure($"Product {product.Name} is not available");
                    }

                    var reserveResponse = await catalogClient.PostAsJsonAsync(
                        $"/api/v1/products/{item.ProductId}/reserve",
                        new { Stock = item.Unit });

                    if (!reserveResponse.IsSuccessStatusCode)
                    {
                        await ReleaseReservedStockAsync(catalogClient, reservedItems);
                        var error = await reserveResponse.Content.ReadAsStringAsync();
                        return ServiceResult<OrderResponse>.Failure(
                            reserveResponse.StatusCode == System.Net.HttpStatusCode.Conflict
                                ? $"Insufficient stock for {product.Name}"
                                : $"Failed to reserve stock for {product.Name}: {error}");
                    }

                    reservedItems.Add((item.ProductId, item.Unit));

                    orderItems.Add(new OrderItem
                    {
                        ProductId = item.ProductId,
                        ProductName = product.Name,
                        UnitPrice = product.Price,
                        Unit = item.Unit
                    });
                }
                catch (HttpRequestException ex)
                {
                    logger.LogError(ex, "Catalog service unavailable");
                    await ReleaseReservedStockAsync(catalogClient, reservedItems);
                    return ServiceResult<OrderResponse>.Failure("Catalog service unavailable");
                }
            }

            try
            {
                var order = new Order
                {
                    UserId = userId,
                    ShippingAddress = request.ShippingAddress,
                    Notes = request.Notes,
                    Items = orderItems,
                    TotalAmount = orderItems.Sum(i => i.UnitPrice * i.Unit)
                };

                db.Orders.Add(order);
                await db.SaveChangesAsync();

                logger.LogInformation("Order created: {OrderId} for user {UserId}", order.IdOrder, userId);


                var orderCreatedEvent = new OrderCreatedEvent(
                    order.IdOrder,
                    userId,
                    orderItems.Select(i => new OrderItemEvent(i.ProductId, i.ProductName, i.Unit)));

                await publishEndpoint.Publish(orderCreatedEvent);

                return ServiceResult<OrderResponse>.SuccessResult(MapToResponse(order), "Order created successfully");
            }
            catch (Exception ex)
            {
                // Si falla al guardar la orden, liberar el stock que ya se bajó
                logger.LogError(ex, "Failed to save order, releasing reserved stock");
                await ReleaseReservedStockAsync(catalogClient, reservedItems);
                return ServiceResult<OrderResponse>.Failure("Failed to create order");
            }
        }

        private async Task ReleaseReservedStockAsync(HttpClient catalogClient, List<(Guid ProductId, int Units)> reservedItems)
        {
            foreach (var (productId, units) in reservedItems)
            {
                try
                {
                    await catalogClient.PostAsJsonAsync(
                        $"/api/v1/products/{productId}/release",
                        new { Stock = units });

                    logger.LogInformation("Released stock for product {ProductId}: +{Units}", productId, units);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Failed to release reserved stock for product {ProductId}", productId);
                }

            }
        }

        public async Task<ServiceResult> CancelOrder(Guid orderId, Guid userId)
        {
            var order = await db.Orders
                 .Include(o => o.Items)
                 .FirstOrDefaultAsync(o => o.IdOrder == orderId);

            if (order is null)
            {
                return ServiceResult<OrderResponse>.Failure("Order not found");
            }

            if (order.UserId != userId)
            {
                return ServiceResult<OrderResponse>.Failure("Access denied");
            }

            if (order.Status != OrderStatus.Pending && order.Status != OrderStatus.Confirmed)
            {
                return ServiceResult<OrderResponse>.Failure($"Order cannot be cancelled. Current status is {order.Status}");
            }

            var catalogClient = httpClientFactory.CreateClient("catalog");
            foreach (var item in order.Items)
            {
                try
                {
                    var response = await catalogClient.PostAsJsonAsync(
                        $"/api/v1/products/{item.ProductId}/release",
                        new { Unit = item.Unit });

                    if (!response.IsSuccessStatusCode)
                    {
                        logger.LogWarning(
                            "Failed to release stock for product {ProductId} on order {OrderId} cancellation",
                            item.ProductId, orderId);
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex,
                        "Error releasing stock for product {ProductId} on order {OrderId} cancellation",
                        item.ProductId, orderId);
                }
            }

            order.Status = OrderStatus.Cancelled;
            order.UpdatedAt = DateTime.UtcNow;

            db.Orders.Update(order);
            await db.SaveChangesAsync();

            logger.LogInformation("Order {OrderId} cancelled by user {UserId}.", orderId, userId);

            var orderCancelledEvent = new OrderCancelledEvent(
                order.IdOrder,
                userId,
                order.Items.Select(i => new OrderItemEvent(i.ProductId, i.ProductName, i.Unit)));

            await publishEndpoint.Publish(orderCancelledEvent);

            return ServiceResult<OrderResponse>.SuccessResult(MapToResponse(order), "Order cancelled successfully");
        }

        public async Task<ServiceResult<IEnumerable<OrderListResponse>>> GetAllOrdersAsync(OrderStatus? status, Guid? userId)
        {
            var query = db.Orders.AsQueryable();

            if (status.HasValue) 
                query = query.Where(o => o.Status == status.Value);

            
            query = query.Where(o => o.UserId == userId);

            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new OrderListResponse(
                    o.IdOrder, o.Status.ToString(), o.TotalAmount, o.Items.Count, o.CreatedAt))
                .ToListAsync();

            return ServiceResult<IEnumerable<OrderListResponse>>.SuccessResult(orders);
        }

        public async Task<ServiceResult<OrderResponse>> GetByIdForAdminAsync(Guid id)
        {
            var order = await db.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.IdOrder == id);

            if (order is null)
            {
                return ServiceResult<OrderResponse>.Failure("Order not found");
            }

            return ServiceResult<OrderResponse>.SuccessResult(MapToResponse(order));
        }

        public async Task<ServiceResult> UpdateStatusAsync(Guid id, OrderStatus newStatus)
        {
            var order = await db.Orders.FirstOrDefaultAsync(o => o.IdOrder == id);

            if (order is null)
            {
                return ServiceResult.Failure("Order not found");
            }

            if (!IsValidStatusTransition(order.Status, newStatus))
            {
                var msg = $"Cannot transition from {order.Status} to {newStatus}";
                return ServiceResult.Failure(msg); 
            }

            order.Status = newStatus;
            order.UpdatedAt = DateTime.UtcNow;

            await db.SaveChangesAsync();

            logger.LogInformation("Order status updated: {OrderId} -> {Status}", id, newStatus);

            return ServiceResult.SuccessResult("Order status updated successfully");
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
                i.Id, i.ProductId, i.ProductName, i.UnitPrice, i.Unit, i.Total)));

    }
}