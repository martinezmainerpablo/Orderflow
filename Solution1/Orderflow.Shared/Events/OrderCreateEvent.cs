using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Orderflow.Shared.Events
{
    public sealed record OrderCreatedEvent(
        Guid OrderId,
        Guid UserId,
        IEnumerable<OrderItemEvent> Items) : IIntegrationEvent
    {
        public Guid EventId { get; init; } = Guid.NewGuid();
        public DateTime Timestamp { get; init; } = DateTime.UtcNow;
    }

    public sealed record OrderItemEvent(
        Guid ProductId,
        string ProductName,
        int Units);
}
