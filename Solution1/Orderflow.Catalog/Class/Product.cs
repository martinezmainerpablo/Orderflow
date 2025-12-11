namespace Orderflow.Catalog.Class
{
    public class Product
    {
        public Guid IdProduct { get; set; } = Guid.NewGuid();
        public required string Name { get; set; }
        public required string Description { get; set; }
        public required decimal Price { get; set; }
        public required int Stock { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime? UpdatedAt { get; set; }

        public Guid CategoryId { get; set; }
        public Category? Category { get; set; }
    }
}