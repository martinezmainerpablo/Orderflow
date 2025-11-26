using FluentValidation;
using static Orderflow.Identity.DTOs.RolDTO;
using static Orderflow.Identity.DTOs.UserAdminDTO;

namespace Orderflow.Identity.DTOs
{
    public class UserAdminDTO
    {
        //creamos la clase con los parametros que necesitamos para crear el usuario
        public record UserAdminCreationRequest
        {
            public required string UserName { get; set; }
            public required string Email { get; set; }
            public required string Password { get; set; }

            public required string RolName { get; set; }

        }

        //creamos un DTO para actualizar el usuario con los parametros que queremos para las validaciones
        public record UserAdminUpdateRequest
        {
            public required string UserName { get; set; }
            public required string Email { get; set; }
            public required string Password { get; set; }
        }

        public record UserAdminUpdateRolRequest
        {
            public required string rolName { get; set; }
        }
    }
    public class UserAdminCreationRequestValidator : AbstractValidator<UserAdminCreationRequest>
    {
        public UserAdminCreationRequestValidator()
        {
            RuleFor(x => x.UserName)
                .NotEmpty().WithMessage("Rol name is required.")
                .MinimumLength(3).WithMessage("First name must be at least 3 characters long.")
                .MaximumLength(50).WithMessage("First name cannot exceed 50 characters.");
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Email format is invalid")
                .MaximumLength(256).WithMessage("Email must not exceed 256 characters");
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
            RuleFor(x => x.RolName)
                .NotEmpty().WithMessage("Rol name is required.")
                .MinimumLength(3).WithMessage("First name must be at least 3 characters long.")
                .MaximumLength(50).WithMessage("First name cannot exceed 50 characters.");
        }
    }

    public class UserAdminUpdateRequestValidator : AbstractValidator<UserAdminUpdateRequest>
    {
        public UserAdminUpdateRequestValidator()
        {
            RuleFor(x => x.UserName)
                .NotEmpty().WithMessage("Rol name is required.")
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

    public class UserAdminUpdateRolRequestValidator : AbstractValidator<UserAdminUpdateRolRequest>
    {
        public UserAdminUpdateRolRequestValidator()
        {
            RuleFor(x => x.rolName)
                .NotEmpty().WithMessage("Rol name is required.")
                .MinimumLength(3).WithMessage("First name must be at least 3 characters long.")
                .MaximumLength(50).WithMessage("First name cannot exceed 50 characters.");
        }
    }
}
