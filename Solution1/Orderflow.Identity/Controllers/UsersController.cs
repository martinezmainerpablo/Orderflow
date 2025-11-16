using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;


namespace Orderflow.Identity.Controllers{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ILogger<UsersController> _logger;
        private readonly IConfiguration _configuration;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly SignInManager<IdentityUser> _signInManager;

        //este es el contructor con los parametros que necesitamos
        public UsersController(ILogger<UsersController> logger,
            IConfiguration configuration,
            UserManager<IdentityUser> userManager,
            SignInManager<IdentityUser> signInManager)
        {

            _logger = logger;
            _configuration = configuration;
            _userManager = userManager;
            _signInManager = signInManager;
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


            if (!result.Succeeded) {
                _logger.LogError("Error al crear el usuario: {Errors}",
                    string.Join(", ", result.Errors.Select(e => e.Description)));

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

        //actualiza un usuario
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, UserUpdateRequest request)
        {
            //busca el id del usuario
            var user = await _userManager.FindByIdAsync(id);

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
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
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

    //creamos un DTO para actualizar el usuario con los parametros que queremos para las validaciones
    public record UserUpdateRequest()
    {
        public required string UserName { get; set; }
        public required string Password { get; set; }
    }
   
}

