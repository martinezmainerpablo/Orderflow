using Aspire.Hosting;

var builder = DistributedApplication.CreateBuilder(args);

//registra un servidor de Postgres
var postgres = builder.AddPostgres("postgres")
    .WithDataVolume(isReadOnly: false)
    .WithLifetime(ContainerLifetime.Persistent)
    .WithPgAdmin(pgAdmin => pgAdmin.WithHostPort(5050));

//registra un servidor de Redis
var redis = builder.AddRedis("redis")
    .WithLifetime(ContainerLifetime.Persistent)
    .WithDataVolume("redis-data-identity")
    .WithRedisInsight();

//registra rabbit
var rabbit = builder
    .AddRabbitMQ("rabbitMQ")
    .WithLifetime(ContainerLifetime.Persistent)
    .WithDataVolume("rabbit")
    .WithManagementPlugin();

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
            .WithReference(redis)  //añadimos redis al api gateway
            .WithReference(rabbit) //añadimos rabbitmq al api gateway
            .WithReference(identity)
            .WaitFor(redis)
            .WaitFor(rabbit)
            .WaitFor(identity);


builder.Build().Run();
