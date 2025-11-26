using FluentValidation;
using static Orderflow.Identity.DTOs.UserAdminDTO;
using static Orderflow.Identity.DTOs.UserDTO;

namespace Orderflow.Identity.DTOs
{
    public class UserDTO
    {
        //creamos un DTO para actualizar el usuario con los parametros que queremos para las validaciones
        public record UserUpdateNameRequest 
        {
            public required string UserName { get; set; }
        }
        public record  UserUpdatePasswordRequest
        {
            public required string Password { get; set; }
        }

        public record UserResponse
        {
            public required string Id { get; set; }
            public required string UserName { get; set; }
            public required string Email { get; set; }
            public required string NameRol { get; set; }
        }
    }

    public class UserUpdateNameRequestValidator : AbstractValidator<UserUpdateNameRequest>
    {
        public UserUpdateNameRequestValidator()
        {
            RuleFor(x => x.UserName)
                .NotEmpty().WithMessage("Rol name is required.")
                .MinimumLength(3).WithMessage("First name must be at least 3 characters long.")
                .MaximumLength(50).WithMessage("First name cannot exceed 50 characters.");
        }
    }

    public class UserUpdatePasswordRequestValidator : AbstractValidator<UserUpdatePasswordRequest>
    {
        public UserUpdatePasswordRequestValidator()
        {

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
