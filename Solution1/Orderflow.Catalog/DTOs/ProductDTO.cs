namespace Orderflow.Catalog.DTOs
{
    public record ProductResponse(
        Guid Id,
        string Name,
        string? Description,
        decimal Price,
        int Stock,
        bool IsActive,
        Guid CategoryId,
        string CategoryName);

    public record ProductListResponse(
        Guid Id,
        string Name,
        decimal Price,
        int Stock,
        bool IsActive,
        string CategoryName);

    public record CreateProductRequest
    {
        public required string Name { get; set; }
        public required string Description { get; set; }
        public required decimal Price { get; set; }
        public required int Stock { get; set; } = 0;
        public required Guid CategoryId { get; set; }
        public required string CategoryName { get; set; }

    }

    public record UpdateStockRequest { 
        public required Guid Id { get; set; }
        public required int Stock { get; set; }
    }
    public record UpdateStockResponse
    {
        public required string mensage { get; set; }
        public required Guid Id { get; set; }
        public required string Name { get; set; }
        public required int Stock { get; set; }
    }

    public record UpdatePriceRequest { 
        public required Guid Id { get; set; }
        public required decimal Price { get; set; }
    }

    public record UpdatePriceResponse
    {
        public required string mensage { get; set; }
        public required Guid Id { get; set; }
        public required string Name { get; set; }
        public required decimal Price { get; set; }
    };

}
