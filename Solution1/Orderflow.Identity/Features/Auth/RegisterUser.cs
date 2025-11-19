using System.Runtime.CompilerServices;

namespace Orderflow.Identity.Features.Auth
{
    public static class RegisterUSer
    {
        public record Request (string UserName, string Email, string Password);

        public record Response (string UserName, string Email, string RolName, string Message);

        public static IEndpointRouteBuilder MapRegisterUser(this IEndpointRouteBuilder group) { 
        
            var AuthGroup = group.MapAuthGroup();

            AuthGroup.MapPost("/register" , HandlerAsync)
                .WithName("Register")
                .AllowAnonymous();


            return AuthGroup;
        }

        private static async Task HandlerAsync(HttpContext context)
        {

            throw new NotImplementedException();
        }
    }
}
