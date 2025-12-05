using Microsoft.EntityFrameworkCore;
using Orderflow.Catalog.Class;
using Orderflow.Catalog.Data;
using Orderflow.Catalog.DTOs;

namespace Orderflow.Catalog.Services
{
    public class CategoryService(CatalogDbContext db, ILogger<CategoryService> logger) : ICategoryService
    {
        public async Task<IEnumerable<CategoryResponse>> GetAllAsync()
        {
            var categories = await db.Categories
                .Select(c => new CategoryResponse(c.IdCategory, c.Name, c.Description, c.Products.Count))
                .ToListAsync();

            return categories;
        }

        public async Task<CategoryResponse> GetByIdAsync(Guid id)
        {
            var category = await db.Categories
                .Where(c => c.IdCategory.Equals(id))
                .Select(c => new CategoryResponse(c.IdCategory, c.Name, c.Description, c.Products.Count))
                .FirstOrDefaultAsync();

            return category;
        }

        public async Task<CategoryResponse> CreateAsync(CreateCategoryRequest request)
        {
            var category = new Category
            {
                Name = request.Name,
                Description = request.Description
            };

            db.Categories.Add(category);

            await db.SaveChangesAsync();

            logger.LogInformation("Category {CategoryName} created with Id {CategoryId}", category.Name, category.IdCategory);

            var createC = new CategoryResponse(category.IdCategory, category.Name, category.Description, 0);

            return createC;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var category = await db.Categories
                    .Include(c => c.Products)
                    .FirstOrDefaultAsync(c => c.IdCategory == id);

            if (category is null)
            {         
                return false;
            }

            if (category.Products.Any())
            {
                return false;
            }

            db.Categories.Remove(category);

            await db.SaveChangesAsync();

            logger.LogInformation("Category deleted: {CategoryId}", id); 

            return true;
        }
    }
}
