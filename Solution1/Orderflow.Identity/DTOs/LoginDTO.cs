namespace Orderflow.Identity.DTOs
{
    public class LoginDTO
    {
        public record UserCreationRequest
        {
            public required string UserName { get; set; }
            public required string Email { get; set; }
            public required string Password { get; set; }

        }
        public record LoginRequest()
        {
            public required string Email { get; set; }
            public required string Password { get; set; }
        }
    }
}
