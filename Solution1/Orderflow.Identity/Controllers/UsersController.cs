using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Orderflow.Identity.DTOs;


namespace Orderflow.Identity.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ILogger<UsersController> _logger;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly SignInManager<IdentityUser> _signInManager;

        //este es el contructor con los parametros que necesitamos
        public UsersController(ILogger<UsersController> logger, 
            UserManager<IdentityUser> userManager, 
            SignInManager<IdentityUser> signInManager)
        {

            _logger = logger;
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

        //actualiza un usuario
        [HttpPut("{id}")] 
        public async Task<IActionResult> Update(IdentityUser user)
        {

            await _userManager.UpdateAsync(user);
            return NoContent();
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
                return BadRequest(result.Errors);
            }

            return NoContent();
        }

        //el usuario se pueda logear
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null) return Unauthorized();

            var signInResult = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, lockoutOnFailure: true);
            if (!signInResult.Succeeded) return Unauthorized();

            var roles = await _userManager.GetRolesAsync(user);

            return Ok($"El usuario se ha logeado");
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

    //creamos un DTO para actualizar el usuario con los parametros que queremos
    public record UserUpdateRequest
    {
        public required string UserName { get; set; }
        public required string Password { get; set; }
    }
}
