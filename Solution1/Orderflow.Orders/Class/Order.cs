namespace Orderflow.Orders.Class
{
    public class Order
    {
        public Guid IdOrder { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; } 
        public decimal TotalAmount { get; set; }
        public string ShippingAddress { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public OrderStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    }
}
