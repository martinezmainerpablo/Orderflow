using Microsoft.AspNetCore.Mvc;
using Orderflow.Orders.Class;
using Orderflow.Orders.DTOs;

namespace Orderflow.Orders.Services
{
    public interface IOrderService
    {
        //user methods
        Task<ServiceResult<IEnumerable<OrderListResponse>>> GetUserOrdersAsync(Guid userId);
        Task<ServiceResult<OrderResponse>> GetOrderByIdAsync(Guid orderId, Guid userId);
        Task<ServiceResult<OrderResponse>> CreateOrderAsync(Guid userId, CreateOrderRequest request);
        Task<IActionResult> CancelOrder(Guid orderId, Guid userId);


        //admin methods
        Task<ServiceResult<IEnumerable<OrderListResponse>>> GetAllOrdersAsync(OrderStatus? status, Guid? userId);
        Task<ServiceResult<OrderResponse>> GetByIdForAdminAsync(Guid id);
        Task<OrderResponse> UpdateStatusAsync(Guid id, OrderStatus newStatus);
    }
}
