namespace Orderflow.Catalog.Class
{
    public class Category
    {
        public Guid IdCategory { get; set; } = Guid.NewGuid();
        public required string Name { get; set; } 
        public required string Description { get; set; }


        public ICollection<Product> Products { get; set; } = [];
    }
}
