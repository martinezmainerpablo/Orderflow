using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Orderflow.Identity.DTOs;
using static Orderflow.Identity.DTOs.RolDTO;

namespace Orderflow.Identity.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] //solo el admin puede acceder a este controlador
    public class RolesController : ControllerBase
    {
        private readonly ILogger<UsersController> _logger;
        private readonly RoleManager<IdentityRole> _rolManager;

        //este es el contructor con los parametros que necesitamos
        public RolesController(ILogger<UsersController> logger,
            RoleManager<IdentityRole> rolManager)
        {

            _logger = logger;
            _rolManager = rolManager;
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
        public async Task<IActionResult> CreateRole(RoleCreationRequest request,  
           [FromServices] RoleCreationRequestValidator validator)
        {
            var validationResult = await validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors);
            }
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
