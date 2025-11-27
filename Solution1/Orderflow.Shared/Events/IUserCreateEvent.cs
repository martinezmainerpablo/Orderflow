using MassTransit;
using System;
using System.Collections.Generic;
using System.Text;

namespace OrderFlowClase.Shared.Events
{
    [ExcludeFromTopology]
    public interface IUserCreateEvent
    {
        public Guid EventId { get; } 

        public DateTime CreatedAt { get; }

    }
}
