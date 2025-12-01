using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Orderflow.Catalog.Data;


var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

// Add PostgreSQL DbContext
builder.AddNpgsqlDbContext<CatalogDbContext>("categorydb");


// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<CatalogDbContext>();
    await db.Database.MigrateAsync();

    app.MapOpenApi();
}

app.MapDefaultEndpoints();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
