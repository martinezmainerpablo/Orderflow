# OrderFlow - Sistema de Gestión de Pedidos y Logística

**Proyecto basado en Microservicios con .NET Aspire**

---

## 📋 Tabla de Contenidos

- [Visión General](#visión-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Componentes Principales](#componentes-principales)
- [Microservicios Detallados](#microservicios-detallados)
- [Comunicación entre Servicios](#comunicación-entre-servicios)
- [Infraestructura](#infraestructura)
- [Flujo de Ejemplo Completo](#flujo-de-ejemplo-completo)
- [Configuración de .NET Aspire](#configuración-de-net-aspire)
- [Estructura del Proyecto](#estructura-del-proyecto)

---

## 🎯 Visión General

**OrderFlow** es un sistema empresarial real para la gestión de pedidos, inventario, clientes y facturación, construido con una arquitectura de microservicios usando .NET Aspire.

### Objetivos del Proyecto

- Aprender arquitectura de microservicios en un contexto real
- Implementar autenticación con ASP.NET Core Identity y JWT
- Gestionar comunicación síncrona (HTTP REST) y asíncrona (RabbitMQ)
- Utilizar .NET Aspire para orquestación y observabilidad
- Aplicar patrones de diseño modernos (Database per Service, API Gateway, Event-Driven)

### Características Principales

- ✅ Autenticación y autorización con JWT
- ✅ Gestión de catálogo de productos e inventario
- ✅ Procesamiento de pedidos con validación de stock
- ✅ Gestión de perfiles y direcciones de clientes
- ✅ Sistema de notificaciones basado en eventos
- ✅ API Gateway con rate limiting y circuit breaker
- ✅ Frontend React consumiendo microservicios

---

## 🏗️ Arquitectura del Sistema

### Capas de la Arquitectura

#### 1. **Frontend Layer**
* React SPA (Single Page Application)
* Puerto: 5173
* Comunicación HTTPS con API Gateway

#### 2. **API Gateway Layer**
* YARP (Yet Another Reverse Proxy)
* Patrón BFF (Backend for Frontend)
* Rate Limiting con Redis
* Circuit Breaker con Polly
* Punto de entrada único para el frontend

#### 3. **Microservices Layer**
Cinco microservicios independientes:
* **Identity Service**: Autenticación y usuarios
* **Catalog Service**: Productos e inventario
* **Orders Service**: Gestión de pedidos
* **Customers Service**: Perfiles y direcciones
* **Notifications Service**: Envío de emails y webhooks

#### 4. **Data Layer**
* PostgreSQL: Una base de datos por microservicio (Database per Service pattern)
  * `identitydb`: Usuarios y roles
  * `catalogdb`: Productos e inventario
  * `ordersdb`: Pedidos y líneas de pedido
  * `customersdb`: Clientes y direcciones

#### 5. **Infrastructure Layer**
* **Redis**: Cache distribuido, sesiones, rate limiting
* **RabbitMQ**: Message broker para eventos asíncronos
* **pgAdmin**: Gestión de bases de datos PostgreSQL

#### 6. **Orchestration Layer**
* **.NET Aspire AppHost**: Orquestador de contenedores y servicios
* **Service Discovery**: Resolución automática de servicios
* **Health Checks**: Monitorización de salud de servicios
* **Telemetry**: OpenTelemetry para observabilidad

---

## 🧩 Componentes Principales

### Tabla Resumen

| Componente | Tecnología | Puerto | Responsabilidad |
|-----------|-----------|--------|-----------------|
| **React Web** | React 18+ | 5173 | Interfaz de usuario |
| **API Gateway** | YARP + ASP.NET Core | 5000 | Routing, autenticación, rate limiting |
| **Identity Service** | ASP.NET Core Identity | 5001 | JWT auth, usuarios, roles |
| **Catalog Service** | ASP.NET Core Web API | 5002 | CRUD productos, gestión stock |
| **Orders Service** | ASP.NET Core Web API | 5003 | Creación y gestión de pedidos |
| **Customers Service** | ASP.NET Core Web API | 5004 | Perfiles y direcciones |
| **Notifications Service** | ASP.NET Core Worker | - | Procesamiento de eventos |
| **PostgreSQL** | PostgreSQL 16 | 5432 | Persistencia de datos |
| **Redis** | Redis 7 | 6379 | Cache distribuido |
| **RabbitMQ** | RabbitMQ 3.13 | 5672/15672 | Message broker |
| **Aspire Dashboard** | .NET Aspire | 15888 | Monitorización y logs |

---

## 📦 Microservicios Detallados

### 🔐 Identity Service - Autenticación y Usuarios

**Responsabilidad única**: Gestionar usuarios y autenticación mediante JWT tokens

#### Entidades del Modelo
```csharp
User
├── Id (Guid)
├── Email (string, unique)
├── PasswordHash (string)
├── FirstName (string)
├── LastName (string)
├── Role (enum: Admin, Customer, Warehouse)
├── IsEmailConfirmed (bool)
├── CreatedAt (DateTime)
└── LastLoginAt (DateTime?)

RefreshToken
├── Id (Guid)
├── UserId (Guid)
├── Token (string)
├── ExpiresAt (DateTime)
├── IsRevoked (bool)
└── CreatedAt (DateTime)
```

#### API Endpoints

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Crear nueva cuenta de usuario | No |
| POST | `/api/auth/login` | Iniciar sesión (devuelve JWT) | No |
| POST | `/api/auth/refresh` | Renovar token expirado | No |
| POST | `/api/auth/logout` | Cerrar sesión (revoca refresh token) | Sí |
| GET | `/api/auth/me` | Obtener datos del usuario actual | Sí |
| PUT | `/api/auth/change-password` | Cambiar contraseña | Sí |

#### Tecnologías

- ASP.NET Core Identity
- JWT (JSON Web Tokens)
- Entity Framework Core
- PostgreSQL
- Redis (para cache de tokens)

#### Flujo de Autenticación

1. Usuario se registra con email/password
2. Sistema crea usuario y asigna rol por defecto (Customer)
3. Usuario hace login con credenciales
4. Sistema valida y genera:
   - **Access Token** (JWT): Expira en 1 hora
   - **Refresh Token**: Expira en 7 días
5. Usuario usa Access Token en cada petición
6. Cuando expira, usa Refresh Token para obtener nuevo Access Token

---

### 📦 Catalog Service - Productos e Inventario

**Responsabilidad única**: Gestionar el catálogo de productos y control de stock

#### Entidades del Modelo
```csharp
Product
├── Id (Guid)
├── Name (string)
├── Description (string)
├── Price (decimal)
├── Stock (int)
├── CategoryId (Guid)
├── ImageUrl (string?)
├── IsActive (bool)
├── CreatedAt (DateTime)
└── UpdatedAt (DateTime)

Category
├── Id (Guid)
├── Name (string)
├── Description (string?)
└── IsActive (bool)
```

#### API Endpoints

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | Listar productos (paginado, filtrado) | No |
| GET | `/api/products/{id}` | Obtener detalle de producto | No |
| POST | `/api/products` | Crear nuevo producto | Admin |
| PUT | `/api/products/{id}` | Actualizar producto | Admin |
| DELETE | `/api/products/{id}` | Eliminar producto (soft delete) | Admin |
| GET | `/api/products/{id}/stock` | Consultar stock disponible | No |
| PUT | `/api/products/{id}/stock` | Actualizar stock | Warehouse/Admin |
| GET | `/api/categories` | Listar categorías | No |
| POST | `/api/categories` | Crear categoría | Admin |

#### Funcionalidades Adicionales

- **Búsqueda**: Por nombre, descripción, categoría
- **Filtrado**: Por precio, stock disponible, categoría
- **Paginación**: Resultados paginados (ej: 20 productos por página)
- **Cache**: Productos más consultados en Redis
- **Validación de Stock**: Endpoint interno para Orders Service

#### Eventos Publicados (RabbitMQ)

- `ProductCreatedEvent`: Cuando se crea un producto
- `StockUpdatedEvent`: Cuando cambia el stock
- `StockLowEvent`: Cuando stock < 10 unidades (alerta)

---

### 🛒 Orders Service - Gestión de Pedidos

**Responsabilidad única**: Crear y gestionar pedidos de clientes

#### Entidades del Modelo
```csharp
Order
├── Id (Guid)
├── OrderNumber (string, ej: "ORD-001")
├── UserId (Guid)
├── CustomerId (Guid)
├── OrderDate (DateTime)
├── Status (enum: Pending, Confirmed, Shipped, Delivered, Cancelled)
├── TotalAmount (decimal)
├── Notes (string?)
├── CreatedAt (DateTime)
├── UpdatedAt (DateTime)
└── OrderItems (List<OrderItem>)

OrderItem
├── Id (Guid)
├── OrderId (Guid)
├── ProductId (Guid)
├── ProductName (string) // Snapshot
├── Quantity (int)
├── UnitPrice (decimal) // Snapshot
└── Subtotal (decimal)
```

#### API Endpoints

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders` | Crear nuevo pedido | Customer |
| GET | `/api/orders` | Listar mis pedidos | Customer |
| GET | `/api/orders/{id}` | Obtener detalle de pedido | Customer/Admin |
| PUT | `/api/orders/{id}/status` | Cambiar estado del pedido | Admin/Warehouse |
| DELETE | `/api/orders/{id}` | Cancelar pedido | Customer/Admin |
| GET | `/api/orders/stats` | Estadísticas de pedidos | Admin |

#### Flujo de Creación de Pedido

1. Cliente envía lista de productos y cantidades
2. **Validación de Stock** (HTTP → Catalog Service):
   - Verifica que haya stock suficiente para cada producto
   - Si no hay stock, devuelve error 400
3. **Obtención de Datos de Cliente** (HTTP → Customers Service):
   - Obtiene dirección de envío
   - Valida que el cliente tenga dirección configurada
4. **Cálculo de Total**:
   - Consulta precios actuales de productos
   - Calcula subtotales y total del pedido
5. **Creación del Pedido**:
   - Guarda pedido en estado "Pending"
   - Usa snapshots (productName, unitPrice) para mantener histórico
6. **Publicación de Evento** (RabbitMQ):
   - `OrderCreatedEvent` con detalles del pedido

#### Eventos Publicados

- `OrderCreatedEvent`: Pedido creado exitosamente
- `OrderConfirmedEvent`: Pedido confirmado por admin
- `OrderShippedEvent`: Pedido enviado
- `OrderDeliveredEvent`: Pedido entregado
- `OrderCancelledEvent`: Pedido cancelado

---

### 👥 Customers Service - Datos de Clientes

**Responsabilidad única**: Gestionar información de clientes (perfiles y direcciones)

#### Entidades del Modelo
```csharp
Customer
├── Id (Guid)
├── UserId (Guid) // Relación con Identity Service
├── FirstName (string)
├── LastName (string)
├── Phone (string?)
├── CompanyName (string?)
├── TaxId (string?)
├── CreatedAt (DateTime)
├── UpdatedAt (DateTime)
└── Addresses (List<Address>)

Address
├── Id (Guid)
├── CustomerId (Guid)
├── Street (string)
├── City (string)
├── State (string?)
├── PostalCode (string)
├── Country (string)
├── IsDefault (bool)
├── Type (enum: Billing, Shipping, Both)
└── CreatedAt (DateTime)
```

#### API Endpoints

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/customers/me` | Obtener mi perfil de cliente | Customer |
| PUT | `/api/customers/me` | Actualizar mi perfil | Customer |
| POST | `/api/customers/addresses` | Añadir nueva dirección | Customer |
| GET | `/api/customers/addresses` | Listar mis direcciones | Customer |
| PUT | `/api/customers/addresses/{id}` | Actualizar dirección | Customer |
| DELETE | `/api/customers/addresses/{id}` | Eliminar dirección | Customer |
| PUT | `/api/customers/addresses/{id}/default` | Marcar como predeterminada | Customer |

#### Funcionalidades

- **Auto-creación**: Cuando un usuario se registra, se crea automáticamente un perfil básico de cliente
- **Validación de Direcciones**: Validación de campos obligatorios y formato
- **Dirección Predeterminada**: Solo una puede ser predeterminada por tipo
- **Integración con Orders**: Orders Service consulta la dirección de envío

#### Eventos Consumidos

- `UserRegisteredEvent` (de Identity): Crea perfil básico de cliente

#### Eventos Publicados

- `CustomerRegisteredEvent`: Cuando se completa el perfil del cliente
- `CustomerUpdatedEvent`: Cuando se actualiza información del cliente

---

### 📧 Notifications Service - Envío de Notificaciones

**Responsabilidad única**: Procesar eventos y enviar notificaciones (emails, webhooks)

#### Características

- **Stateless**: No tiene base de datos propia
- **Event Consumer**: Solo consume eventos de RabbitMQ
- **Multi-canal**: Soporta email y webhooks

#### Eventos que Consume

| Evento | Acción | Destinatario |
|--------|--------|--------------|
| `OrderCreatedEvent` | Email: "Pedido confirmado" | Cliente |
| `OrderShippedEvent` | Email: "Pedido en camino" | Cliente |
| `OrderDeliveredEvent` | Email: "Pedido entregado" | Cliente |
| `OrderCancelledEvent` | Email: "Pedido cancelado" | Cliente |
| `CustomerRegisteredEvent` | Email: "Bienvenido" | Cliente |
| `StockLowEvent` | Email: "Alerta de stock bajo" | Admin/Warehouse |

#### Configuración
```csharp
EmailSettings
├── SmtpServer (string, ej: smtp.gmail.com)
├── SmtpPort (int, ej: 587)
├── UseSsl (bool)
├── SenderEmail (string)
├── SenderName (string)
└── Username/Password (credenciales)

// Alternativa: SendGrid, Mailgun, etc.
EmailProviderSettings
└── ApiKey (string)

WebhookSettings
└── Urls (List<string>) // URLs a notificar
```

#### Plantillas de Email

- HTML Templates con datos dinámicos
- Uso de Razor Pages o Handlebars
- Personalización por tipo de evento

#### Tecnologías

- ASP.NET Core Worker Service
- MailKit / SendGrid SDK
- RabbitMQ Client
- Razor para templates

---

## 🔄 Comunicación entre Servicios

### Comunicación Síncrona (HTTP REST)

Usado cuando se necesita respuesta inmediata.

#### Orders → Catalog
```http
GET http://catalog-service/api/products/{id}/stock
Authorization: Bearer {jwt_token}

Response:
{
  "productId": "123",
  "stock": 50,
  "available": true
}
```

#### Orders → Customers
```http
GET http://customers-service/api/customers/{id}/addresses/default
Authorization: Bearer {jwt_token}

Response:
{
  "id": "456",
  "street": "Calle Mayor 123",
  "city": "Madrid",
  "postalCode": "28001",
  "country": "Spain"
}
```

### Comunicación Asíncrona (RabbitMQ Events)

Usado para notificaciones y desacoplamiento.

#### Estructura de un Evento
```csharp
public class OrderCreatedEvent
{
    public Guid OrderId { get; set; }
    public string OrderNumber { get; set; }
    public Guid UserId { get; set; }
    public decimal TotalAmount { get; set; }
    public List<OrderItemDto> Items { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

#### Flujo de Eventos
```
Orders Service (Publisher)
    ↓ Publish OrderCreatedEvent
RabbitMQ Exchange
    ↓ Route to Queues
    ├─→ notifications-queue → Notifications Service (envía email)
    └─→ catalog-queue → Catalog Service (reduce stock)
```

#### Configuración de RabbitMQ
```csharp
// Exchange type: Topic
Exchange: "orderflow.events"

// Queues
Queue: "orders.created" → Routing Key: "orders.created"
Queue: "orders.shipped" → Routing Key: "orders.shipped"
Queue: "stock.updated" → Routing Key: "catalog.stock.*"
```

---

## 🏗️ Infraestructura

### PostgreSQL - Bases de Datos

**Una base de datos por microservicio** (Database per Service pattern)

| Base de Datos | Servicio | Tablas Principales |
|--------------|----------|-------------------|
| `identitydb` | Identity | Users, Roles, RefreshTokens |
| `catalogdb` | Catalog | Products, Categories |
| `ordersdb` | Orders | Orders, OrderItems |
| `customersdb` | Customers | Customers, Addresses |

**Migraciones**: Cada servicio gestiona sus propias migraciones con Entity Framework Core
```bash
# Ejemplo: Crear migración en Catalog Service
cd OrderFlow.Catalog
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### Redis - Cache Distribuido

**Usos en el sistema**:

1. **Identity Service**: Cache de tokens válidos
2. **Catalog Service**: Cache de productos frecuentemente consultados
3. **API Gateway**: Rate limiting (contador de peticiones por IP/usuario)
4. **Session Storage**: Carritos de compra temporales
```csharp
// Ejemplo: Cache de producto
var cacheKey = $"product:{productId}";
var cachedProduct = await cache.GetStringAsync(cacheKey);

if (cachedProduct == null)
{
    var product = await dbContext.Products.FindAsync(productId);
    await cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(product), 
        new DistributedCacheEntryOptions 
        { 
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10) 
        });
    return product;
}

return JsonSerializer.Deserialize<Product>(cachedProduct);
```

### RabbitMQ - Message Broker

**Topología**:
- **Exchange Type**: Topic
- **Durabilidad**: Queues y mensajes persistentes
- **Acknowledgments**: Manual (para garantizar procesamiento)

**Configuración básica**:
```csharp
// Publisher (Orders Service)
var factory = new ConnectionFactory { HostName = "rabbitmq" };
using var connection = factory.CreateConnection();
using var channel = connection.CreateModel();

channel.ExchangeDeclare("orderflow.events", ExchangeType.Topic, durable: true);

var message = JsonSerializer.Serialize(new OrderCreatedEvent { ... });
var body = Encoding.UTF8.GetBytes(message);

channel.BasicPublish(
    exchange: "orderflow.events",
    routingKey: "orders.created",
    basicProperties: null,
    body: body
);
```
```csharp
// Consumer (Notifications Service)
channel.QueueDeclare("notifications-queue", durable: true, exclusive: false, autoDelete: false);
channel.QueueBind("notifications-queue", "orderflow.events", "orders.*");

var consumer = new EventingBasicConsumer(channel);
consumer.Received += async (model, ea) =>
{
    var body = ea.Body.ToArray();
    var message = Encoding.UTF8.GetString(body);
    var @event = JsonSerializer.Deserialize<OrderCreatedEvent>(message);
    
    await SendEmailAsync(@event);
    
    channel.BasicAck(ea.DeliveryTag, multiple: false);
};

channel.BasicConsume("notifications-queue", autoAck: false, consumer);
```

---

## 📊 Flujo de Ejemplo Completo

### Caso de Uso: Cliente realiza una compra

#### 1. **Autenticación** (Identity Service)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "Password123!"
}

Response 200 OK:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "d8f7a6b5...",
  "expiresIn": 3600
}
```

#### 2. **Búsqueda de Productos** (Catalog Service)
```http
GET /api/products?search=laptop&page=1&pageSize=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response 200 OK:
{
  "items": [
    {
      "id": "123",
      "name": "Laptop HP Pavilion",
      "price": 799.99,
      "stock": 15,
      "category": "Laptops"
    }
  ],
  "totalCount": 1,
  "page": 1,
  "pageSize": 10
}
```

#### 3. **Creación de Pedido** (Orders Service)
```http
POST /api/orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "items": [
    {
      "productId": "123",
      "quantity": 2
    }
  ]
}
```

**Proceso interno en Orders Service**:
```
a) Validar JWT token
b) Extraer UserId del token
c) Llamar a Catalog: GET /api/products/123/stock
   ← Response: { stock: 15, available: true }
d) Llamar a Customers: GET /api/customers/me/addresses/default
   ← Response: { street: "Calle Mayor 123", city: "Madrid", ... }
e) Calcular total: 2 × 799.99 = 1599.98
f) Crear pedido en BD con estado "Pending"
g) Publicar OrderCreatedEvent en RabbitMQ
```
```http
Response 201 Created:
{
  "orderId": "ORD-001",
  "orderNumber": "ORD-001",
  "status": "Pending",
  "totalAmount": 1599.98,
  "items": [
    {
      "productName": "Laptop HP Pavilion",
      "quantity": 2,
      "unitPrice": 799.99,
      "subtotal": 1599.98
    }
  ],
  "createdAt": "2025-11-08T10:30:00Z"
}
```

#### 4. **Procesamiento de Eventos**

##### Catalog Service escucha `OrderCreatedEvent`:
```
1. Recibe evento de RabbitMQ
2. Reduce stock: 15 → 13 unidades
3. Actualiza BD
4. Publica StockUpdatedEvent
```

##### Notifications Service escucha `OrderCreatedEvent`:
```
1. Recibe evento de RabbitMQ
2. Construye email con plantilla HTML
3. Envía email a juan@example.com:
   
   Subject: "¡Pedido Confirmado! - ORD-001"
   Body:
   Hola Juan,
   
   Tu pedido ORD-001 ha sido confirmado.
   Total: 1599.98€
   
   Productos:
   - Laptop HP Pavilion (x2) - 1599.98€
   
   Estado: Pendiente de envío
   
   ¡Gracias por tu compra!
```

#### 5. **Consulta de Pedido** (Orders Service)
```http
GET /api/orders/ORD-001
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response 200 OK:
{
  "orderId": "ORD-001",
  "orderNumber": "ORD-001",
  "status": "Pending",
  "totalAmount": 1599.98,
  "orderDate": "2025-11-08T10:30:00Z",
  "shippingAddress": {
    "street": "Calle Mayor 123",
    "city": "Madrid",
    "postalCode": "28001",
    "country": "Spain"
  },
  "items": [...]
}
```

---

## 🚀 Configuración de .NET Aspire

### AppHost - Orquestador Principal
```csharp
// OrderFlow.AppHost/Program.cs
var builder = DistributedApplication.CreateBuilder(args);

// ============================================
// INFRAESTRUCTURA
// ============================================

// PostgreSQL con pgAdmin para gestión
var postgres = builder.AddPostgres("postgres")
    .WithPgAdmin()
    .WithLifetime(ContainerLifetime.Persistent);

// Bases de datos individuales por servicio
var identityDb = postgres.AddDatabase("identitydb");
var catalogDb = postgres.AddDatabase("catalogdb");
var ordersDb = postgres.AddDatabase("ordersdb");
var customersDb = postgres.AddDatabase("customersdb");

// Redis para cache distribuido
var redis = builder.AddRedis("cache")
    .WithLifetime(ContainerLifetime.Persistent);

// RabbitMQ para mensajería
var messaging = builder.AddRabbitMQ("messaging")
    .WithManagementPlugin()
    .WithLifetime(ContainerLifetime.Persistent);

// ============================================
// MICROSERVICIOS
// ============================================

// Identity Service
var identityService = builder.AddProject<Projects.OrderFlow_Identity>("identity")
    .WithReference(identityDb)
    .WithReference(redis);

// Catalog Service
var catalogService = builder.AddProject<Projects.OrderFlow_Catalog>("catalog")
    .WithReference(catalogDb)
    .WithReference(redis)
    .WithReference(messaging);

// Orders Service
var ordersService = builder.AddProject<Projects.OrderFlow_Orders>("orders")
    .WithReference(ordersDb)
    .WithReference(messaging)
    .WithReference(catalogService)    // Para validar stock
    .WithReference(customersService);  // Para obtener direcciones

// Customers Service
var customersService = builder.AddProject<Projects.OrderFlow_Customers>("customers")
    .WithReference(customersDb)
    .WithReference(messaging);

// Notifications Service (Worker)
var notificationsService = builder.AddProject<Projects.OrderFlow_Notifications>("notifications")
    .WithReference(messaging);

// ============================================
// API GATEWAY
// ============================================

var apiGateway = builder.AddProject<Projects.OrderFlow_ApiGateway>("gateway")
    .WithReference(identityService)
    .WithReference(catalogService)
    .WithReference(ordersService)
    .WithReference(customersService)
    .WithReference(redis);

// ============================================
// FRONTEND
// ============================================

var frontend = builder.AddNpmApp("web", "../OrderFlow.Web")
    .WithReference(apiGateway)
    .WithHttpEndpoint(port: 5173, env: "PORT")
    .WithExternalHttpEndpoints()
    .PublishAsDockerFile();

builder.Build().Run();
```

### ServiceDefaults - Configuración Compartida
```csharp
// OrderFlow.ServiceDefaults/Extensions.cs
public static class Extensions
{
    public static IHostApplicationBuilder AddServiceDefaults(
        this IHostApplicationBuilder builder)
    {
        // Health Checks
        builder.Services.AddHealthChecks();

        // OpenTelemetry para observabilidad
        builder.Services.AddOpenTelemetry()
            .WithMetrics(metrics =>
            {
                metrics.AddAspNetCoreInstrumentation()
                       .AddHttpClientInstrumentation()
                       .AddRuntimeInstrumentation();
            })
            .WithTracing(tracing =>
            {
                tracing.AddAspNetCoreInstrumentation()
                       .AddHttpClientInstrumentation()
                       .AddEntityFrameworkCoreInstrumentation();
            });

        // Resilience con Polly
        builder.Services.AddHttpClient()
            .AddStandardResilienceHandler(options =>
            {
                options.CircuitBreaker.SamplingDuration = TimeSpan.FromSeconds(10);
                options.AttemptTimeout.Timeout = TimeSpan.FromSeconds(5);
                options.TotalRequestTimeout.Timeout = TimeSpan.FromSeconds(30);
            });

        // Service Discovery
        builder.Services.AddServiceDiscovery();

        return builder;
    }

    public static IHostApplicationBuilder AddDefaultEndpoints(
        this WebApplication app)
    {
        // Health Check endpoints
        app.MapHealthChecks("/health");
        app.MapHealthChecks("/alive", new HealthCheckOptions
        {
            Predicate = _ => false
        });

        return app;
    }
}
```

### Configuración en cada Microservicio
```csharp
// OrderFlow.Catalog/Program.cs
var builder = WebApplication.CreateBuilder(args);

// Añadir configuración compartida de Aspire
builder.AddServiceDefaults();

// Añadir DbContext con conexión a PostgreSQL
builder.AddNpgsqlDbContext<CatalogDbContext>("catalogdb");

// Añadir Redis
builder.AddRedisClient("cache");

// Añadir RabbitMQ
builder.Services.AddSingleton<IMessagePublisher, RabbitMqPublisher>(sp =>
{
    var connection = sp.GetRequiredService<IConnection>();
    return new RabbitMqPublisher(connection);
});

var app = builder.Build();

// Endpoints de Aspire (health checks, etc)
app.MapDefaultEndpoints();

// Tu código de la aplicación
app.MapControllers();

await app.RunAsync();
```

---

## 📁 Estructura del Proyecto

```mermaid
graph TB
    %% Estilos
    classDef frontend fill:#61dafb,stroke:#333,stroke-width:3px,color
