using OrderFlowClase.Shared.Events;

namespace Orderflow.Shared
{
    public sealed record UserCreateEvents(string userId, string email) : IUserCreateEvent
    {
        public Guid EventId => Guid.NewGuid();
        public DateTime CreatedAt => DateTime.UtcNow;
    }
}
