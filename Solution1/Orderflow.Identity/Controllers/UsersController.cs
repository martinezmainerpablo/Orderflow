using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Orderflow.Identity.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ILogger<UsersController> _logger;
        private readonly UserManager<IdentityUser> _userManager;

        //este es el contructor con los parametros que necesitamos
       public UsersController(ILogger<UsersController> logger, UserManager<IdentityUser> userManager) { 
        
            _logger= logger;
            _userManager= userManager;
       }

        //creamos la funcion crear al usuario
        [HttpPost("creater")]
        public async Task<ActionResult<UserCreationResponse>> CreateUser(UserCreationRequest request) {

            var user = new IdentityUser
            {
                UserName = request.UserName,
                Email = request.Email
            };

            var result = await _userManager.CreateAsync(user, request.Password);


            if(!result.Succeeded) {
                _logger.LogError("Error al crear el usuario: {Errors}",
                    string.Join(", ", result.Errors.Select(e=> e.Description)));

                //devolvemos los errores en la respuesta 
                return BadRequest(new UserCreationResponse
                {
                    Email = request.Email,
                    Message = "Usuario failed",
                    Errors = result.Errors.Select(e => e.Description)
                });
            }

            _logger.LogInformation("user created successfully: {Email}", request.Email);

            //devolvemos el okey en la respuesta
            return Ok(new UserCreationResponse
            {
                 Email = request.Email,
                 Message = "Usuario creado con exito"
            });
            
        }
        /*
        //actualizar un usuario
        [HttpPost("update")]
        public async Task<ActionResult> UpdateUser(IdentityUser request)
        {
            // Buscar el usuario por email
            var user = await _userManager.FindByEmailAsync(request.Email);

            if (user == null)
            {
                _logger.LogWarning("Usuario no encontrado: {Email}", request.Email);
                return NotFound(new UserCreationResponse
                {
                    Email = request.Email,
                    Message = "Usuario no encontrado"
                });
            }

            // Actualizamos los campos necesarios
            user.UserName = request.UserName;
            user.Email = request.Email;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                _logger.LogError("Error al actualizar el usuario: {Errors}",
                    string.Join(", ", result.Errors.Select(e => e.Description)));

                return BadRequest(new UserCreationResponse
                {
                    Email = request.Email,
                    Message = "Actualización fallida",
                    Errors = result.Errors.Select(e => e.Description)
                });
            }

            // Si también se quiere actualizar la contraseña
            if (!string.IsNullOrEmpty(request.Password))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var passwordResult = await _userManager.ResetPasswordAsync(user, token, request.Password);

                if (!passwordResult.Succeeded)
                {
                    _logger.LogError("Error al actualizar la contraseña: {Errors}",
                        string.Join(", ", passwordResult.Errors.Select(e => e.Description)));

                    return BadRequest(new UserCreationResponse
                    {
                        Email = request.Email,
                        Message = "Actualización de contraseña fallida",
                        Errors = passwordResult.Errors.Select(e => e.Description)
                    });
                }
            }

            _logger.LogInformation("Usuario actualizado correctamente: {Email}", request.Email);

            return Ok(new UserCreationResponse
            {
                Email = request.Email,
                Message = "Usuario actualizado con éxito"
            });
        }

        //borrar un usuario
        [HttpPost("delete")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            return NoContent();
        }
        */
    }

    //clase para poder monstrar los datos introducidos por el usuario
    public record UserCreationResponse 
    {
        public required string Email { get; set; }
        public required string Message { get; set; }
        public IEnumerable<string>? Errors { get; set; }

    }

    //creamos la clase con los parametros que necesitamos para crear el usuario
    public record UserCreationRequest
    {
        public required string UserName { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }

    }
}
