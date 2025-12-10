using Microsoft.AspNetCore.Mvc;
using Orderflow.Orders.Class;
using Orderflow.Orders.DTOs;

namespace Orderflow.Orders.Services
{
    public interface IOrderService
    {
        //user methods
        Task<IEnumerable<OrderListResponse>> GetUserOrdersAsync(Guid userId);
        Task<OrderResponse> GetOrderByIdAsync(Guid orderId, Guid userId);
        Task<OrderResponse> CreateOrderAsync(Guid userId, CreateOrderRequest request);
        Task<IActionResult> CancelOrder(Guid orderId, Guid userId);


        //admin methods
        Task<IEnumerable<OrderListResponse>> GetAllOrdersAsync(OrderStatus? status, Guid? userId);
        Task<OrderResponse> GetByIdForAdminAsync(Guid id);
        Task<OrderResponse> UpdateStatusAsync(Guid id, OrderStatus newStatus);
    }
}
