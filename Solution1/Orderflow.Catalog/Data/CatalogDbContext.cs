using Microsoft.EntityFrameworkCore;
using Orderflow.Catalog.Class;

namespace Orderflow.Catalog.Data
{
    public class CatalogDbContext(DbContextOptions<CatalogDbContext> options) : DbContext(options)
    {
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Product> Products => Set<Product>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.IdCategory);
                entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(500).IsRequired();
                entity.HasIndex(e => e.Name).IsUnique();
            });

            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.IdProduct);
                entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(1000).IsRequired();
                entity.Property(e => e.Price).HasPrecision(18, 2).IsRequired();

                entity.HasOne(e => e.Category)
                    .WithMany(c => c.Products)
                    .HasForeignKey(e => e.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.CategoryId);
                entity.HasIndex(e => e.IsActive);
            });
        }
    }
}
