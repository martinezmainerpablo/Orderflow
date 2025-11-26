using FluentValidation;
using static Orderflow.Identity.DTOs.LoginDTO;
using static Orderflow.Identity.DTOs.RolDTO;

namespace Orderflow.Identity.DTOs
{
    public class RolDTO
    {
        public class RoleCreationRequest
        {
            public required string RoleName { get; set; }
        }
    }

    public class RoleCreationRequestValidator : AbstractValidator<RoleCreationRequest>
    {
        public RoleCreationRequestValidator()
        {
            RuleFor(x => x.RoleName)
                .NotEmpty().WithMessage("Rol name is required.")
                .MinimumLength(3).WithMessage("First name must be at least 3 characters long.")
                .MaximumLength(50).WithMessage("First name cannot exceed 50 characters.");
        }
    }
}
