using MassTransit;
using Orderflow.Shared.Events;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Orderflow.Notification.Consumer
{
    public class OrderCancelledConsumer(ILogger<OrderCancelledConsumer> logger) : IConsumer<OrderCancelledEvent>
    {
        public Task Consume(ConsumeContext<OrderCancelledEvent> context)
        {
            var @event = context.Message;

            logger.LogInformation(
                "Processing OrderCancelledEvent: EventId={EventId}, OrderId={OrderId}, UserId={UserId}, Items={ItemCount}",
                @event.EventId, @event.OrderId, @event.UserId, @event.Items.Count());

            // Future: Send cancellation email, trigger refund process, etc.

            return Task.CompletedTask;
        }
    }
}
