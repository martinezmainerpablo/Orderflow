using Microsoft.AspNetCore.Identity;
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

        private static async Task<IResult> HandlerAsync(Request request, UserManager<IdentityUser> usermanager)
        {
            var user = new IdentityUser
            {
                UserName = request.UserName,
                Email = request.Email
            };

            var result = await usermanager.CreateAsync(user, request.Password);

            return Results.Ok();

        }
    }
}
