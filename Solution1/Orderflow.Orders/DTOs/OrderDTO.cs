using System;
using System.Collections.Generic;
using System.Linq;
using Orderflow.Orders.Class;

namespace Orderflow.Orders.DTOs
{
    public record OrderResponse
    {
        public Guid Id { get; init; }
        public Guid UserId { get; init; }
        public string Status { get; init; } = string.Empty;
        public decimal TotalAmount { get; init; }
        public string? ShippingAddress { get; init; }
        public string? Notes { get; init; }
        public DateTime CreatedAt { get; init; }
        public DateTime? UpdatedAt { get; init; }
        public IEnumerable<OrderItemResponse> Items { get; init; } = Enumerable.Empty<OrderItemResponse>();

        public bool IsSuccess { get; init; }
        public string Message { get; init; } = string.Empty;
        public OrderResponse(
            Guid id,
            Guid userId,
            string status,
            decimal totalAmount,
            string? shippingAddress,
            string? notes,
            DateTime createdAt,
            DateTime? updatedAt,
            IEnumerable<OrderItemResponse> items)
        {
            // Asignación de datos
            Id = id;
            UserId = userId;
            Status = status;
            TotalAmount = totalAmount;
            ShippingAddress = shippingAddress;
            Notes = notes;
            CreatedAt = createdAt;
            UpdatedAt = updatedAt;
            Items = items;

            // Inicialización de las propiedades de resultado por defecto (Fallido)
            IsSuccess = false;
            Message = string.Empty;
        }
        private OrderResponse(OrderResponse data, string message)
        {
            Id = data.Id;
            UserId = data.UserId;
            Status = data.Status;
            TotalAmount = data.TotalAmount;
            ShippingAddress = data.ShippingAddress;
            Notes = data.Notes;
            CreatedAt = data.CreatedAt;
            UpdatedAt = data.UpdatedAt;
            Items = data.Items;

            IsSuccess = true;
            Message = message;
        }

        private OrderResponse(string message)
        {
            Id = Guid.Empty;
            UserId = Guid.Empty;
            Status = "Failed";
            TotalAmount = 0;
            CreatedAt = DateTime.UtcNow;

            IsSuccess = false;
            Message = message;
        }

        public static OrderResponse Success(OrderResponse data, string message = "Operation successful.")
        {
            return new OrderResponse(data, message);
        }

        public static OrderResponse Failure(string message)
        {
            return new OrderResponse(message);
        }
    }

    public record OrderListResponse(
        Guid Id,
        string Status,
        decimal TotalAmount,
        int ItemCount,
        DateTime CreatedAt);

    public record OrderItemResponse(
        Guid Id,
        Guid ProductId,
        string ProductName,
        decimal UnitPrice,
        int Units,
        decimal Subtotal);

    public record CreateOrderRequest(
        string? ShippingAddress,
        string? Notes,
        IEnumerable<CreateOrderItemRequest> Items);

    public record CreateOrderItemRequest(
        Guid ProductId,
        int Units);

    public record UpdateOrderStatusRequest(OrderStatus Status);
}