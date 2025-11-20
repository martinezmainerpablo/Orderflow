using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Orderflow.Identity.Data;
using static Orderflow.Identity.DTOs.UserAdminDTO;

namespace Orderflow.Identity.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] //solo el admin puede acceder a este controlador
    public class UsersAdminController : ControllerBase
    {
        private readonly ILogger<UsersController> _logger;
        private readonly IConfiguration _configuration;
        private readonly UserManager<IdentityUser> _userManager;

        //este es el contructor con los parametros que necesitamos
        public UsersAdminController(ILogger<UsersController> logger,
            IConfiguration configuration,
            UserManager<IdentityUser> userManager)
        {

            _logger = logger;
            _configuration = configuration;
            _userManager = userManager;
        }

        //mostrar todos los usuarios
        [HttpGet("all")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = _userManager.Users.ToList();
            var result = new List<object>();

            foreach (var u in users)
            {
                var roles = await _userManager.GetRolesAsync(u);
                result.Add(new
                {
                    u.Id,
                    u.UserName,
                    u.Email,
                    NameRol = roles.FirstOrDefault() ?? ""
                });
            }

            return Ok(result);
        }

        //mostrar un usuario por id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound("Usuario no encontrado");

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                user.Id,
                user.UserName,
                user.Email,
                Roles = roles // saca el primero rol que tenga el usuario o todos
            });
        }

        //creamos la funcion crear al usuario
        [HttpPost("Creater")]
        public async Task<ActionResult<UserAdminCreationRequest>> CreateUser(UserAdminCreationRequest request)
        {

            var user = new IdentityUser
            {
                UserName = request.UserName,
                Email = request.Email
                
            };

            var result = await _userManager.CreateAsync(user, request.Password);


            if (!result.Succeeded)
            {
                _logger.LogError("Error al crear el usuario: {Errors}",
                    string.Join(", ", result.Errors.Select(e => e.Description)));

                //devolvemos los errores en la respuesta 
                return BadRequest(new UserAdminCreationResponse
                {
                    Email = request.Email,
                    RolName = "error",
                    Message = "Usuario failed",
                    Errors = result.Errors.Select(e => e.Description)
                });
            }

            _logger.LogInformation("user created successfully: {Email}", request.Email);
            await _userManager.AddToRoleAsync(user, request.RolName);
            //devolvemos el okey en la respuesta
            return Ok(new UserAdminCreationResponse
            {
                Email = request.Email,
                RolName = request.RolName,
                Message = "Usuario creado con exito"
            });

        }

        //actualiza un usuario
        [HttpPut("Update/{id}")]
        public async Task<IActionResult> Update(string id, UserAdminUpdateRequest request)
        {
            //busca el id del usuario
            var user = await _userManager.FindByIdAsync(id);

            if (user == null)
            {
                return NotFound("Usuario no encontrado");
            }

            // Recogemos el nuevo nombre y la contraseña y la cambiamos
            user.UserName = request.UserName;
            user.Email = request.Email;
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
        [HttpDelete("Delete/{id}")]
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

            return Ok($"El usuario ha sido borrado con exito");
        }

        //actualizo el rol de un usuario
        [HttpPost("RemoveRol/{id}")]
        public async Task<IActionResult> UpdateRol(string id, UserAdminUpdateRolRequest request)
        {
            // Buscar usuario por Id
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound("Usuario no encontrado");
            }

            // Obtener roles actuales del usuario
            var rolUser = await _userManager.GetRolesAsync(user);

            // Eliminar roles actuales
            var borrarRol = await _userManager.RemoveFromRolesAsync(user, rolUser);
            if (!borrarRol.Succeeded)
            {
                return BadRequest(borrarRol.Errors);
            }

            // Asignar nuevo rol
            var userRol = await _userManager.AddToRoleAsync(user, request.rolName);
            if (!userRol.Succeeded)
            {
                return BadRequest(userRol.Errors);
            }

            return Ok("El rol del usuario ha sido actualizado con éxito");
        }
    }

    //clase para poder monstrar los datos introducidos por el usuario
    public record UserAdminCreationResponse
    {
        public required string Email { get; set; }
        public required string RolName { get; set; }
        public required string Message { get; set; }
        public IEnumerable<string>? Errors { get; set; }

    }



}
