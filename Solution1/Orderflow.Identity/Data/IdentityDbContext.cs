using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Data.Entity;

namespace Orderflow.Identity.Data
{
    public class ApplicactionDbConext : IdentityDbContext<IdentityUser>
    {
        public ApplicactionDbConext(DbContextOptions<ApplicactionDbConext> options)
        :base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
        }

    }
}
