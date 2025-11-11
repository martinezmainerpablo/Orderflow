 var builder = DistributedApplication.CreateBuilder(args);

//registra un servidor de Postgres
var postgres = builder.AddPostgres("postgres");

//se añade una base de datos específica
var identitydb = postgres.AddDatabase("identitydb");

//microservicio
var identityService= builder.AddProject<Projects.Orderflow_Identity>("orderflow-identity")
    .WaitFor(postgres)            //hasta que no lanzamos postgres no inicia la bd
    .WithReference(identitydb);    //referencia a la base de datos


var webApp = builder.AddNpmApp("orderflowweb", "../orderflow.web", "dev")   
                .WithReference(identityService)  
                .WithHttpEndpoint(port: 51909, env: "PORT")
                .WithExternalHttpEndpoints()
                .PublishAsDockerFile();
                

builder.Build().Run();
