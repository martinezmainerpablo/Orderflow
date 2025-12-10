using MassTransit;
using Microsoft.Extensions.Logging;
using Orderflow.Shared.Events;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Orderflow.Shared.Consumer
{
    public class OrderCreatedConsumer(ILogger<OrderCreatedConsumer> logger) : IConsumer<OrderCreatedEvent>
    {
        public Task Consume(ConsumeContext<OrderCreatedEvent> context)
        {
            var @event = context.Message;

            logger.LogInformation(
                "Processing OrderCreatedEvent: EventId={EventId}, OrderId={OrderId}, UserId={UserId}, Items={ItemCount}",
                @event.EventId, @event.OrderId, @event.UserId, @event.Items.Count());

            return Task.CompletedTask;
        }
    }
}
