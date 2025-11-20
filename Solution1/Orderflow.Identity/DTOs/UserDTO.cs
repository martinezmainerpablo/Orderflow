namespace Orderflow.Identity.DTOs
{
    public class UserDTO
    {
        //creamos un DTO para actualizar el usuario con los parametros que queremos para las validaciones
        public record UserUpdateRequest
        {
            public required string UserName { get; set; }
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
}
