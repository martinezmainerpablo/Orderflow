using Microsoft.AspNetCore.Identity;

namespace Orderflow.Identity.Data
{
    public class SeedData
    {
        //creamos un usuario administrador por defecto
        public static async Task CreateAdmin(UserManager<IdentityUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            string adminEmail = "admin@correo.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);

            if (adminUser == null)
            {
                adminUser = new IdentityUser
                {
                    UserName = "Admin",
                    Email = adminEmail,
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(adminUser, "Admin123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "ADMIN");
                    Console.WriteLine("Usuario administrador creado correctamente.");
                }
                else
                {
                    Console.WriteLine("Error al crear usuario administrador:");
                    foreach (var error in result.Errors)
                        Console.WriteLine($" - {error.Description}");
                }
            }
            else
            {
                Console.WriteLine("El usuario admin ya existe.");
            }
        }
    }
}