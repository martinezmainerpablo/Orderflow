using Orderflow.Orders.Class;

namespace Orderflow.Orders.DTOs
{
    public record OrderResponse(
    Guid IdOrder,
    Guid UserId,
    string Status,
    decimal TotalAmount,
    string? ShippingAddress,
    string? Notes,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    IEnumerable<OrderItemResponse> Items);

    public record OrderListResponse(
        Guid IdOrder,
        string Status,
        decimal TotalAmount,
        int ItemCount,
        DateTime CreatedAt);

    public record OrderItemResponse(
        int Id,
        Guid ProductId,
        string ProductName,
        decimal UnitPrice,
        int Unit,
        decimal Total);

    public record CreateOrderRequest(
        string? ShippingAddress,
        string? Notes,
        IEnumerable<CreateOrderItemRequest> Items);

    public record CreateOrderItemRequest(
        Guid ProductId,
        int Unit);

    public record UpdateOrderStatusRequest(OrderStatus Status);
}