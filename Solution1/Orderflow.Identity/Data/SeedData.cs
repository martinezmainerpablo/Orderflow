using Microsoft.AspNetCore.Identity;

namespace Orderflow.Identity.Data
{
    public class SeedData
    {
        //creamos un usuario administrador por defecto
        public static async Task CreateAdmin(UserManager<IdentityUser> userManager, RoleManager<IdentityRole> roleManager, IConfiguration configuration)
        {
            var adminPassword = configuration.GetValue<string>("AdminPassword");

            if (string.IsNullOrEmpty(adminPassword))
            {
                Console.WriteLine("⚠️ ERROR: 'AdminPassword' no se encontró en la configuración. Asegúrate de que el secreto de usuario está configurado.");
                return;
            }

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

                var result = await userManager.CreateAsync(adminUser, adminPassword);
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "ADMIN");
                    await userManager.AddToRoleAsync(adminUser, "USER");
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