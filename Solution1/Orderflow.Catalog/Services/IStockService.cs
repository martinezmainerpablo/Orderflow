using Microsoft.AspNetCore.Mvc;
using Orderflow.Shared;

namespace Orderflow.Catalog.Services
{
    public interface IStockService
    {
        Task<ServiceResult> ReserveStockAsync(Guid productId, int units);
        Task<ServiceResult> ReleaseStockAsync(Guid productId, int units);
    }
}
