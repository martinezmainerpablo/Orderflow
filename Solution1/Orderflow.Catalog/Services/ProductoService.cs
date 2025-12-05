using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Orderflow.Catalog.Class;
using Orderflow.Catalog.Data;
using Orderflow.Catalog.DTOs;

namespace Orderflow.Catalog.Services
{
    public class ProductoService(CatalogDbContext db, ILogger<ProductoService> logger) : IProductService
    {
        // Implementación de los métodos de IProductService
        public async Task<IEnumerable<ProductListResponse>> GetAllAsync()
        {
            var products = await db.Products
             .Select(p => new ProductListResponse(p.IdProduct,p.Name,p.Price,p.Stock,p.IsActive, p.Category!.Name))
             .ToListAsync();

            return products;
        }

        public async Task<ProductResponse> GetByIdAsync(Guid id)
        {
            var product = await  db.Products
                .Include(p => p.Category)
                .Where(p => p.IdProduct == id)
                .Select(p => new ProductResponse(
                    p.IdProduct, p.Name, p.Description, p.Price, p.Stock, p.IsActive,p.CategoryId, p.Category!.Name))
                .FirstOrDefaultAsync();

            return product;
        }

        public async Task<ProductResponse> CreateAsync(CreateProductRequest request)
        {
            var product = new Product
            {
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                Stock = request.Stock,
                CategoryId = request.CategoryId
            };
            db.Products.Add(product);
            await db.SaveChangesAsync();

            logger.LogInformation("Product created: {ProductId}", product.IdProduct);

            var productC = new ProductResponse(
                product.IdProduct,
                product.Name,
                product.Description,
                product.Price,
                product.Stock,
                product.IsActive,
                product.CategoryId,
                request.CategoryName);

            return productC;
        }
        public async Task<UpdateStockResponse?> UpdateStockAsync(UpdateStockRequest request) { 
        
            var product = db.Products.FirstOrDefault(p => p.IdProduct == request.Id);

            if (product is null)
            {
                return null;
            }

            product.Stock = request.Stock;

            await db.SaveChangesAsync();

            return new UpdateStockResponse
            {
                mensage = "El stock del producto a sido actualizado",
                Id = product.IdProduct,
                Name = product.Name,
                Stock = product.Stock
            };
        }

        public async Task<UpdatePriceResponse?> UpdatePriceAsync(UpdatePriceRequest request) 
        {
            var product = db.Products.FirstOrDefault(p => p.IdProduct == request.Id);

            if (product is null)
            {
                return null;
            }

            product.Price = request.Price;

            await db.SaveChangesAsync();

            return new UpdatePriceResponse
            {
                mensage ="El precio del producto a sido actualizado",
                Id = product.IdProduct, 
                Name = product.Name,
                Price = product.Price
            };

        }
        public async Task<bool> DeleteAsync(Guid id)
        {
            var product = await db.Products.FindAsync(id);

            if (product is null)
            {
                return false;
            }

            db.Products.Remove(product);

            await db.SaveChangesAsync();

            logger.LogInformation("Product deleted: {ProductId}", id);

            return true;
        }
    }
}
