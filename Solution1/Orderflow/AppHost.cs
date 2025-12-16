
var builder = DistributedApplication.CreateBuilder(args);

builder.AddDockerComposeEnvironment("orderflow");

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
    .WithDataVolume("rabbitMQ")
    .WithManagementPlugin();

// MailDev - Local SMTP server for development (Web UI on 1080, SMTP on 1025)
var mailService = builder.AddContainer("maildev", "maildev/maildev:latest")
    .WithHttpEndpoint(port: 1080, targetPort: 1080, name: "web")
    .WithEndpoint(port: 1025, targetPort: 1025, name: "smtp")
    .WithLifetime(ContainerLifetime.Persistent);

//se añade una base de datos específica
var identitydb = postgres.AddDatabase("identitydb");
var catalogydb = postgres.AddDatabase("categorydb");
var ordersDb = postgres.AddDatabase("ordersdb");

//microservicio
var identityService= builder.AddProject<Projects.Orderflow_Identity>("orderflow-identity")
    .WaitFor(postgres)            //hasta que no lanzamos postgres no inicia la bd
    .WaitFor(rabbit)
    .WithReference(identitydb)
    .WithReference(rabbit);    //referencia a la base de datos


builder.AddProject<Projects.Orderflow_Notification>("orderflow-notification")
    .WaitFor(rabbit)
    .WithEnvironment("Email__SmtpHost", mailService.GetEndpoint("smtp").Property(EndpointProperty.Host))
    .WithEnvironment("Email__SmtpPort", mailService.GetEndpoint("smtp").Property(EndpointProperty.Port))
    .WithReference(rabbit);

var catalogService = builder.AddProject<Projects.Orderflow_Catalog>("orderflow-catalog")
    .WaitFor(catalogydb)
    .WithReference(catalogydb);

var ordersService = builder.AddProject<Projects.Orderflow_Orders>("orderflow-orders")
    .WithReference(ordersDb)
    .WithReference(rabbit)
    .WithReference(catalogService)
    .WaitFor(ordersDb)
    .WaitFor(rabbit);

                      
var apiGateway = builder.AddProject<Projects.Orderflow_ApiGateway>("orderflow-apigateway")
            .WithReference(redis)  //añadimos redis al api gateway
            .WithReference(rabbit) //añadimos rabbitmq al api gateway
            .WithReference(identityService)
            .WithReference(catalogService)
            .WithReference(ordersService)
            .WaitFor(redis)
            .WaitFor(rabbit)
            .WaitFor(identityService)
            .WaitFor(catalogService)
            .WaitFor(ordersService);


var webApp = builder.AddNpmApp("orderflowweb", "../orderflow.web", "dev")
     .WithReference(apiGateway)
     .WithReference(identityService)
     .WithHttpEndpoint(port: 7000, env: "PORT")
     .WaitFor(apiGateway)
     .WithExternalHttpEndpoints()
     .PublishAsDockerFile();

builder.Build().Run();
