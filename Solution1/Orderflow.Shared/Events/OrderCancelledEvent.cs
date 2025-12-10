using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Orderflow.Shared.Events
{
    public sealed record OrderCancelledEvent(
        Guid OrderId,
        Guid UserId,
        IEnumerable<OrderItemEvent> Items) : IIntegrationEvent
    {
        public Guid EventId { get; init; } = Guid.NewGuid();
        public DateTime Timestamp { get; init; } = DateTime.UtcNow;
    }
}
