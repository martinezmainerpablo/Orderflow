using MassTransit;
using Microsoft.Extensions.Logging;
using Orderflow.Notification.Services;
using Orderflow.Shared;

namespace Orderflow.Notification.Consumer
{
    internal class UserRegisteredConsumer : IConsumer<UserCreateEvents>
    {
        private readonly ILogger<UserRegisteredConsumer> _logger;
        private readonly IEmailService _emailService;

        public UserRegisteredConsumer(ILogger<UserRegisteredConsumer> logger, IEmailService emailService)
        {
            _logger = logger;
            _emailService = emailService;
        }

        public async Task Consume(ConsumeContext<UserCreateEvents> context)
        {
            var user = context.Message;

            _logger.LogInformation("New user registered: {UserId}, Name: {firstName}, Email: {Email}", user.userId, user.firstName ,user.email );

            await _emailService.SendWelcomeEmailAsync(
               user.email,
               user.firstName,
               context.CancellationToken);

            _logger.LogInformation(
                "Successfully processed UserRegisteredEvent: EventId={EventId}",
                user.EventId);
        }
    }
}
