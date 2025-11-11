var builder = DistributedApplication.CreateBuilder(args);

//registra un servidor de Postgres
var postgres = builder.AddPostgres("postgres");

//se añade una base de datos específica
var identitydb = postgres.AddDatabase("identitydb");

//añadir la base de datos al proyecto
builder.AddProject<Projects.Orderflow_Identity>("orderflow-identity")
    .WithReference(identitydb);

builder.Build().Run();
