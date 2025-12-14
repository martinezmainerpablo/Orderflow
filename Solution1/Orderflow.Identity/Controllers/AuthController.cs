using MassTransit;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Orderflow.Identity.DTOs;
using Orderflow.Shared.Events;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using static Orderflow.Identity.DTOs.LoginDTO;

namespace Orderflow.Identity.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ILogger<AuthController> _logger;
        private readonly IConfiguration _configuration;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly IPublishEndpoint _publishEndpoint;

        //este es el contructor con los parametros que necesitamos
        public AuthController(ILogger<AuthController> logger,
            IConfiguration configuration,
            UserManager<IdentityUser> userManager,
            SignInManager<IdentityUser> signInManager,
            IPublishEndpoint publishEndpoint)
        {
            _logger = logger;
            _configuration = configuration;
            _userManager = userManager;
            _signInManager = signInManager;
            _publishEndpoint = publishEndpoint;
        }

        //registrar el usuario
        [HttpPost("register")]
        public async Task<IActionResult> Register(UserCreationRequest dto ,
            [FromServices] UserCreationRequestValidator validator)
        {
            
            var validationResult = await validator.ValidateAsync(dto);

            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors);
            }

            var user = new IdentityUser { UserName = dto.UserName, Email = dto.Email};

            var result = await _userManager.CreateAsync(user, dto.Password);

            var userR = await _userManager.FindByEmailAsync(dto.Email);

            if (userR != null)
            {
                await _publishEndpoint.Publish(new UserCreateEvents(userR.Id, userR.UserName! ,userR.Email!));
            }

            if (!result.Succeeded) return BadRequest(result.Errors);
           
            await _userManager.AddToRoleAsync(user, "User");

            return Ok("Usuario registrado con exito");
        }


        //el usuario se pueda logear
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest login)
        {
            var user = await _userManager.FindByEmailAsync(login.Email);
            if (user == null) return Unauthorized();

            var signInResult = await _signInManager.CheckPasswordSignInAsync(user, login.Password, lockoutOnFailure: true);
            if (!signInResult.Succeeded) return Unauthorized();

            var roles = await _userManager.GetRolesAsync(user);
            var token = CreateAccessToken(user, roles);

            var response = new LoginDTO.LoginResponse(
                AccessToken: token,
                TokenType: "Bearer",
                UserId: user.Id,
                Email: user.Email!,
                UserName: user.UserName!,
                Roles: roles
);
            return Ok(response);
        }


        //metodo para crear el token de acceso
        private string CreateAccessToken(IdentityUser user, IList<string> roles)
        {
            var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.UserName ?? ""),
            new Claim(ClaimTypes.Email, user.Email ?? "")
        };

            // añadir roles como claims
            foreach (var role in roles)
                claims.Add(new Claim(ClaimTypes.Role, role));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }


    }


}

