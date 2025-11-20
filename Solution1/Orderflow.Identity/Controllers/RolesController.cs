using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using static Orderflow.Identity.DTOs.RolDTO;

namespace Orderflow.Identity.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] //solo el admin puede acceder a este controlador
    public class RolesController : ControllerBase
    {
        private readonly ILogger<UsersController> _logger;
        private readonly IConfiguration _configuration;
        private readonly RoleManager<IdentityRole> _rolManager;
        private readonly SignInManager<IdentityUser> _signInManager;

        //este es el contructor con los parametros que necesitamos
        public RolesController(ILogger<UsersController> logger,
            IConfiguration configuration,
            RoleManager<IdentityRole> rolManager,
            SignInManager<IdentityUser> signInManager)
        {

            _logger = logger;
            _configuration = configuration;
            _rolManager = rolManager;
            _signInManager = signInManager;
        }

        //mostrar todos los roles
        [HttpGet("all")]
        public IActionResult GetAllRoles()
        {
            var roles = _rolManager.Roles.Select(r => new
            {
                r.Id,
                r.Name,
            }).ToList();
            return Ok(roles);
        }

        //crear un nuevo rol
        [HttpPost("create")]
        public async Task<IActionResult> CreateRole(RoleCreationRequest request)
        {
            var role = new IdentityRole
            {
                Name = request.RoleName
            };
            var result = await _rolManager.CreateAsync(role);
            if (!result.Succeeded)
            {
                _logger.LogError("Error al crear el rol: {Errors}",
                    string.Join(", ", result.Errors.Select(e => e.Description)));
                return BadRequest(new
                {
                    Message = "Fallo al crear el rol",
                    Errors = result.Errors.Select(e => e.Description)
                });
            }
            _logger.LogInformation("Role creo: {RoleName}", request.RoleName);
            return Ok(new
            {
                RoleName = request.RoleName,
                Message = "Role creado"
            });
        }

        //eliminar un rol
        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteRole(RoleCreationRequest request)
        {
            var role = await _rolManager.FindByNameAsync(request.RoleName);
            if (role == null)
            {
                return NotFound(new
                {
                    Message = "Role no encontrado"
                });
            }
            var result = await _rolManager.DeleteAsync(role);
            if (!result.Succeeded)
            {
                _logger.LogError("Error al eliminar el rol: {Errors}",
                    string.Join(", ", result.Errors.Select(e => e.Description)));
                return BadRequest(new
                {
                    Message = "Fallo al eliminar el rol",
                    Errors = result.Errors.Select(e => e.Description)
                });
            }
            _logger.LogInformation("Role eliminado: {RoleName}", request.RoleName);
            return Ok(new
            {
                RoleName = request.RoleName,
                Message = "Role eliminado"
            });
        }
    }

    
}
