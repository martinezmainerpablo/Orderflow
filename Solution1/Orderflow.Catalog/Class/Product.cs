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


        public Guid CategoryId { get; set; }
        public Category? Category { get; set; }
    }
}