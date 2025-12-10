using MassTransit;
using Orderflow.Notification.Consumer;
using Orderflow.Notification.Services;
using Orderflow.Shared.Consumer;

var builder = Host.CreateApplicationBuilder(args);

// Add default service configurations
builder.AddServiceDefaults();

// Register EmailService
builder.Services.AddSingleton<IEmailService, EmailService>();

// Add MassTransit configuration
builder.Services.AddMassTransit(x =>
{
    // Register consumers
    x.AddConsumer<UserRegisteredConsumer>();
    x.AddConsumer<OrderCreatedConsumer>();
    x.AddConsumer<OrderCancelledConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        // Use Aspire service discovery for RabbitMQ connection
        var configuration = context.GetRequiredService<IConfiguration>();
        var connectionString = configuration.GetConnectionString("rabbitMQ");

        if (!string.IsNullOrEmpty(connectionString))
        {
            cfg.Host(new Uri(connectionString));
        }

        // Configure retry policy
        cfg.UseMessageRetry(r => r.Intervals(
            TimeSpan.FromSeconds(1),
            TimeSpan.FromSeconds(5),
            TimeSpan.FromSeconds(15),
            TimeSpan.FromSeconds(30)));

        // Configure endpoints for all consumers
        cfg.ConfigureEndpoints(context);
    });

});

var host = builder.Build();
host.Run();
