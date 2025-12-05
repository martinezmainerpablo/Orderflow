using Orderflow.Catalog.DTOs;

namespace Orderflow.Catalog.Services
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryResponse>> GetAllAsync();
        Task<CategoryResponse>GetByIdAsync(Guid id);
        Task<CategoryResponse> CreateAsync(CreateCategoryRequest request);
        Task<bool> DeleteAsync(Guid id);
    }
}
