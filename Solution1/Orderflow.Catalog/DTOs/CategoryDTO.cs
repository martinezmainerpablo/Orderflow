namespace Orderflow.Catalog.DTOs
{
        public record CreateCategoryRequest
        {
            public required string Name { get; set; }
            public required string Description { get; set; }
        }

        public record CategoryResponse (
             Guid IdCategory,
             string Name,
             string Description,
             int ProductCount
        );
}
