using MassTransit;
using Orderflow.Shared;

namespace Orderflow.Notification
{
    internal class UserRegisteredConsumer : IConsumer<UserCreateEvents>
    {
        private readonly ILogger<UserRegisteredConsumer> _logger;   
        public UserRegisteredConsumer(ILogger<UserRegisteredConsumer> logger)
        {
            _logger = logger;
        }

        public Task Consume(ConsumeContext<UserCreateEvents> context)
        {
            var user = context.Message;

            _logger.LogInformation("New user registered: {UserId}, Email: {Email}", user.userId, user.email );

            return Task.CompletedTask;
        }
    }
}
