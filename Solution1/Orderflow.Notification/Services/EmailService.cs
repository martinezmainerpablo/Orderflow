using MailKit.Net.Smtp;
using MimeKit;

namespace Orderflow.Notification.Services
{
    public class EmailService(IConfiguration configuration, ILogger<EmailService> logger) : IEmailService
    {
        public async Task SendWelcomeEmailAsync(string toEmail, string? firstName, CancellationToken cancellationToken = default)
        {
            var displayName = firstName ?? toEmail.Split('@')[0];

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                configuration["Email:FromName"] ?? "OrderFlow",
                configuration["Email:FromAddress"] ?? "noreply@orderflow.local"));
            message.To.Add(new MailboxAddress(displayName, toEmail));
            message.Subject = "Bienvenido a OrderFlow!";

            message.Body = new TextPart("html")
            {
                Text = $"""
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #333;">Welcome to OrderFlow!</h1>
                    <p>Hola {displayName},</p>
                    <p>Gracias por registrarte en OrderFlow. Tu cuenta ha sido creada exitosamente.</p>
                    <p>Ahora puedes iniciar sesión y comenzar a usar nuestra plataforma.</p>
                    <br/>
                    <p>Saludos cordiales,<br/>El equipo de OrderFlow</p>
                </body>
                </html>
                """
            };

            await SendEmailAsync(message, cancellationToken);

            logger.LogInformation("Welcome email sent to {Email}", toEmail);
        }

        private async Task SendEmailAsync(MimeMessage message, CancellationToken cancellationToken)
        {
            var smtpHost = configuration["Email:SmtpHost"] ?? "localhost";
            var smtpPort = int.Parse(configuration["Email:SmtpPort"] ?? "1025");

            using var client = new SmtpClient();

            try
            {
                await client.ConnectAsync(smtpHost, smtpPort, false, cancellationToken);
                await client.SendAsync(message, cancellationToken);
                await client.DisconnectAsync(true, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send email to {Email}", message.To);
                throw;
            }
        }
    }
}
