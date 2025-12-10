using OrderFlowClase.Shared.Events;

namespace Orderflow.Shared.Events
{
    public sealed record UserCreateEvents(string userId, string firstName, string email) : IUserCreateEvent
    {
        public Guid EventId => Guid.NewGuid();
        public DateTime CreatedAt => DateTime.UtcNow;
    }
}
