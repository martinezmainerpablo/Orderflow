namespace Orderflow.Identity.DTOs
{
    public static class LoginDTO
    {
        public record UserCreationRequest
        {
            public required string UserName { get; set; }
            public required string Email { get; set; }
            public required string Password { get; set; }

        }
        public record LoginRequest
        {
            public required string Email { get; set; }
            public required string Password { get; set; }
        }
        public sealed record LoginResponse(
        
            string AccessToken ,
            string TokenType ,
            string UserId ,
            string Email ,
            IEnumerable<string> Roles
        );
    }
}
