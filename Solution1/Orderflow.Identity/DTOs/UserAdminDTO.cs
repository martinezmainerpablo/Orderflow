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
}
