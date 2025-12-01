
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
    .WithDataVolume("rabbitMQ")
    .WithManagementPlugin();

//se añade una base de datos específica
var identitydb = postgres.AddDatabase("identitydb");

//microservicio
var identity= builder.AddProject<Projects.Orderflow_Identity>("orderflow-identity")
    .WaitFor(postgres)            //hasta que no lanzamos postgres no inicia la bd
    .WaitFor(rabbit)
    .WithReference(identitydb)
    .WithReference(rabbit);    //referencia a la base de datos


// MailDev - Local SMTP server for development (Web UI on 1080, SMTP on 1025)
var maildev = builder.AddContainer("maildev", "maildev/maildev")
    .WithHttpEndpoint(port: 1080, targetPort: 1080, name: "web")
    .WithEndpoint(port: 1025, targetPort: 1025, name: "smtp")
    .WithLifetime(ContainerLifetime.Persistent);


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


builder.AddProject<Projects.Orderflow_Notification>("orderflow-notification")
    .WaitFor(rabbit)
    .WithEnvironment("Email__SmtpHost", maildev.GetEndpoint("smtp").Property(EndpointProperty.Host))
    .WithEnvironment("Email__SmtpPort", maildev.GetEndpoint("smtp").Property(EndpointProperty.Port))
    .WithReference(rabbit);


builder.Build().Run();
