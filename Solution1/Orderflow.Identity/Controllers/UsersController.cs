using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;


namespace Orderflow.Identity.Controllers{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly ILogger<UsersController> _logger;
        private readonly IConfiguration _configuration;
        private readonly UserManager<IdentityUser> _userManager;

        
        //este es el contructor con los parametros que necesitamos
        public UsersController(ILogger<UsersController> logger,
            IConfiguration configuration,
            UserManager<IdentityUser> userManager)
        {

            _logger = logger;
            _configuration = configuration;
            _userManager = userManager;
        }
        
        //metodo para obtener el usuario desde los claims
        private async Task<IdentityUser?> GetUserFromCLaims()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(userId))
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user != null) return user;
            }
            return null;
        }

        [HttpGet("GetMe")]
        public async Task<IActionResult> GetMe()
        {
            var user = await GetUserFromCLaims();
            if (user == null) return Unauthorized("Token inválido o no proporcionado");

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                user.Id,
                user.UserName,
                user.Email,
                NameRol = roles.FirstOrDefault() ?? "" // o devuelve la lista completa
            });
        }

        //actualiza un usuario
        [HttpPut("Update")]
        public async Task<IActionResult> Update(UserUpdateRequest request)
        {
            //busca el id del usuario
            var user = await GetUserFromCLaims();

            if (user == null)
            {
                return NotFound("Usuario no encontrado");
            }

            // Recogemos el nuevo nombre y la contraseña y la cambiamos
            user.UserName = request.UserName;
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var passwordResult = await _userManager.ResetPasswordAsync(user, token, request.Password);

            // Si hay algun error en el nombre o contraseña nos devuelve un error
            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded || !passwordResult.Succeeded)
            {
                return BadRequest(updateResult.Errors);
            }

            return Ok("El usuario ha sido actualizado con exito");
        }

        //borra un usuario
        [HttpDelete("Delete")]
        public async Task<IActionResult> Delete()
        {
            var user = await GetUserFromCLaims();
            if (user == null)
            {
                return NotFound("Usuario no encontrado");
            }

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest("Error al borrar el usuario");
            }

            return Ok($"El usuario borrado con exito");
        }
    }

    //creamos un DTO para actualizar el usuario con los parametros que queremos para las validaciones
    public record UserUpdateRequest
    {
        public required string UserName { get; set; }
        public required string Password { get; set; }
    }
   
    public record UserResponse
    {
        public required string Id { get; set; }
        public required string UserName { get; set; }
        public required string Email { get; set; }
        public required string NameRol { get; set; }
    }
}

