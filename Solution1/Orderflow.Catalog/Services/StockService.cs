using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Orderflow.Catalog.Data;
using Orderflow.Shared;

namespace Orderflow.Catalog.Services
{
    public class StockService(CatalogDbContext db, ILogger<StockService> logger) : IStockService
    {
        public async Task<ServiceResult> ReserveStockAsync(Guid productId, int units)
        {
            // Atomic operation: check and update in single query
            // Works safely with multiple instances
            var rowsAffected = await db.Products
                .Where(p => p.IdProduct == productId && p.Stock >= units)
                .ExecuteUpdateAsync(p => p
                    .SetProperty(x => x.Stock, x => x.Stock - units)
                    .SetProperty(x => x.UpdatedAt, DateTime.UtcNow));

            if (rowsAffected == 0)
            {
                // Check if product exists to provide better error message
                var exists = await db.Products.AnyAsync(p => p.IdProduct == productId);
                if (!exists)
                {
                    logger.LogWarning("Product not found for stock reservation: {ProductId}", productId);
                    return ServiceResult.Failure($"Product {productId} not found");
                }

                logger.LogWarning(
                    "Insufficient stock for product {ProductId}: requested {Unit}",
                    productId, units);
                return ServiceResult.Failure($"Insufficient stock for product {productId}");
            }

            logger.LogInformation(
                "Stock reserved for product {ProductId}: -{Units}",
                productId, units);

            return ServiceResult.SuccessResult();
        }

        public async Task<ServiceResult> ReleaseStockAsync(Guid productId, int units)
        {
            // Atomic operation: update in single query
            var rowsAffected = await db.Products
                .Where(p => p.IdProduct == productId)
                .ExecuteUpdateAsync(p => p
                    .SetProperty(x => x.Stock, x => x.Stock + units)
                    .SetProperty(x => x.UpdatedAt, DateTime.UtcNow));

            if (rowsAffected == 0)
            {
                logger.LogWarning("Product not found for stock release: {ProductId}", productId);
                return ServiceResult.Failure($"Product {productId} not found");
            }

            logger.LogInformation(
                "Stock released for product {ProductId}: +{Units}",
                productId, units);

            return ServiceResult.SuccessResult();
        }
    }
}
