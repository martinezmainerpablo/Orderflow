using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Orderflow.Identity.Data
{
    public class IdentityDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();

            optionsBuilder.UseNpgsql("Host=localhost;Port=63938;Username=postgres;Password=!d+u0DrMk6KUd6WSdA{uW!;Database=identitydb");

            return new ApplicationDbContext (optionsBuilder.Options);
        }

    }
}
