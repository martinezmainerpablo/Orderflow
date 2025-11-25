 var builder = DistributedApplication.CreateBuilder(args);

//registra un servidor de Postgres
var postgres = builder.AddPostgres("postgres")
    .WithDataVolume(isReadOnly: false)
    .WithLifetime(ContainerLifetime.Persistent);

//registra un servidor de Redis
var redis = builder.AddRedis("redis")
    .WithLifetime(ContainerLifetime.Persistent)
    .WithDataVolume("redis-data-identity")
    .WithRedisInsight();

//se añade una base de datos específica
var identitydb = postgres.AddDatabase("identitydb");

//microservicio
var identity= builder.AddProject<Projects.Orderflow_Identity>("orderflow-identity")
    .WaitFor(postgres)            //hasta que no lanzamos postgres no inicia la bd
    .WithReference(identitydb);    //referencia a la base de datos


var webApp = builder.AddNpmApp("orderflowweb", "../orderflow.web", "dev")   
                .WithReference(identity)  
                .WithHttpEndpoint(port: 7000, env: "PORT")
                .WithExternalHttpEndpoints()
                .PublishAsDockerFile();
                
            
builder.AddProject<Projects.Orderflow_ApiGateway>("orderflow-apigateway")
        .WithReference(identity)
    .WaitFor(identity); ;
                
            
builder.Build().Run();
