using FluentValidation;
using static Orderflow.Identity.DTOs.LoginDTO;

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

    
    public class UserCreationRequestValidator : AbstractValidator<UserCreationRequest>
    {
        public UserCreationRequestValidator()
        {
            RuleFor(x => x.UserName)
                .NotEmpty().WithMessage("First name is required.")
                .MinimumLength(3).WithMessage("First name must be at least 3 characters long.")
                .MaximumLength(50).WithMessage("First name cannot exceed 50 characters.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Email format is invalid")
                .MaximumLength(256).WithMessage("Email must not exceed 256 characters");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters long")
                .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter")
                .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter")
                .Matches(@"\d").WithMessage("Password must contain at least one digit")
                .Matches(@"[^\da-zA-Z]").WithMessage("Password must contain at least one special character");

        }      
    }
}
