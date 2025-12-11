namespace Orderflow.Orders.Class
{
    public class OrderItem
    {
        public int Id { get; set; } 
        public Guid OrderId { get; set; }
        public Guid ProductId { get; set; }
        public required string ProductName { get; set; } 
        public decimal UnitPrice { get; set; }
        public int Unit { get; set; }
        public decimal Total => UnitPrice * Unit;
        public Order? Order { get; set; }
    }
}