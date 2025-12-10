using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Orderflow.Shared.Events
{
    public interface IIntegrationEvent
    {
        Guid EventId { get; }
        DateTime Timestamp { get; }
    }
}
