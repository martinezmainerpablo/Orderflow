using Microsoft.AspNetCore.Mvc;
using Orderflow.Catalog.DTOs;

namespace Orderflow.Catalog.Services
{
    public interface IProductService
    {
        Task<IEnumerable<ProductListResponse>> GetAllAsync();
        Task<ProductResponse> GetByIdAsync(Guid id);
        Task<ProductResponse> CreateAsync(CreateProductRequest request);
        Task<UpdateStockResponse?> UpdateStockAsync(UpdateStockRequest request);
        Task<UpdatePriceResponse?> UpdatePriceAsync(UpdatePriceRequest request);
        Task<bool> DeleteAsync(Guid id);
    }
}
