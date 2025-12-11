namespace Orderflow.Orders.Class
{
    public class Order
    {
        public Guid IdOrder { get; set; } = Guid.NewGuid();
        public required Guid UserId { get; set; } 
        public decimal TotalAmount { get; set; }
        public string? ShippingAddress { get; set; }
        public string? Notes { get; set; } 
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public ICollection<OrderItem> Items { get; set; } = [];
    }
}
