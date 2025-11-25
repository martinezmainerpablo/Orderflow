
using Microsoft.Extensions.Hosting;
using Orderflow.ApiGateway.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddYarpReverseProxy(builder.Configuration);

builder.Services.AddGatewayCors();

builder.AddServiceDefaults();

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthorization();

app.MapReverseProxy();

app.MapControllers();

app.Run();
