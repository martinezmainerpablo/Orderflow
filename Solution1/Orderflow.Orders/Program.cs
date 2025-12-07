using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Orderflow.Orders.Data;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

//para poder usar los secretos de usuario
builder.Configuration.AddUserSecrets(typeof(Program).Assembly, true);

// Add PostgreSQL DbContext
builder.AddNpgsqlDbContext<OrdersDbContext>("ordersdb");

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<OrdersDbContext>();
    await db.Database.MigrateAsync();
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
