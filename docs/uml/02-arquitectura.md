# Arquitectura del Sistema

## 1. Vista de componentes

El requisito del enunciado es que **back y front estén desacoplados**. Se cumple
literalmente: son dos aplicaciones independientes, con su propio ciclo de vida,
su propio despliegue y su propio pipeline de CI. El único contrato entre ellas es
HTTP/JSON.

```mermaid
graph TB
    subgraph Cliente["Navegador (Chrome / Firefox)"]
        UI["React 19 + TypeScript<br/>Vite · TailwindCSS"]
    end

    subgraph Front["Vercel"]
        SPA["SPA estática<br/>Landing + Aplicación"]
    end

    subgraph Back["Render — API Laravel 12"]
        direction TB
        RT["Rutas /api/v1<br/>middleware: CORS, throttle, auth opcional"]
        CT["Controllers<br/>(delgados, sin lógica)"]
        FR["FormRequests<br/>(validación de entrada)"]
        SV["Services<br/>(lógica de negocio)"]
        RP["Repositories<br/>(interfaces)"]
        EL["EloquentRepositories<br/>(implementación)"]
        RS["API Resources<br/>(serialización)"]
    end

    subgraph Datos["Neon"]
        PG[("PostgreSQL 17")]
    end

    UI -->|"HTTPS · JSON"| SPA
    SPA -->|"REST · JSON"| RT
    RT --> CT
    CT --> FR
    FR --> SV
    SV --> RP
    RP -.->|"inyección de dependencias"| EL
    EL --> PG
    SV --> RS
    RS -->|"respuesta JSON"| SPA

    style RP stroke-dasharray: 5 5
    style Datos fill:#e8f4f8
```

La línea punteada entre `Repositories` y `EloquentRepositories` es el punto clave:
los servicios dependen de la **interfaz**, nunca de Eloquent. Es el principio de
Inversión de Dependencias hecho estructura, y es lo que permite testear la lógica
de negocio sin tocar la base de datos.

## 2. Flujo de una petición

```mermaid
graph LR
    A["Petición<br/>HTTP"] --> B["Middleware<br/>CORS · rate limit"]
    B --> C["Controller"]
    C --> D["FormRequest<br/>¿datos bien formados?"]
    D -->|"no"| E["422<br/>errores por campo"]
    D -->|"sí"| F["DTO"]
    F --> G["Service<br/>¿regla de negocio?"]
    G -->|"viola regla"| H["Excepción de dominio<br/>422 / 409"]
    G -->|"válido"| I["Repository"]
    I --> J[("PostgreSQL")]
    J --> K["API Resource"]
    K --> L["200 / 201<br/>JSON uniforme"]
```

Hay dos niveles de validación deliberadamente separados:

- **`FormRequest`** responde *"¿está bien formada la petición?"* — tipos, campos
  obligatorios, rangos, unicidad simple. No conoce el negocio.
- **`Service`** responde *"¿tiene sentido en el dominio?"* — la acomodación
  corresponde al tipo, la capacidad alcanza, la combinación no está repetida.

Mezclarlas sería cómodo pero rompería el principio de Responsabilidad Única y
haría imposible reutilizar las reglas fuera de una petición HTTP.

## 3. Diagrama de clases del dominio

```mermaid
classDiagram
    class HotelController {
        -HotelServiceInterface service
        +index(ListHotelsRequest) JsonResponse
        +store(StoreHotelRequest) JsonResponse
        +show(int id) JsonResponse
        +update(UpdateHotelRequest, int id) JsonResponse
        +destroy(int id) JsonResponse
    }

    class HotelServiceInterface {
        <<interface>>
        +paginate(HotelFilterData) LengthAwarePaginator
        +create(HotelData) Hotel
        +update(int id, HotelData) Hotel
        +delete(int id) void
    }

    class HotelService {
        -HotelRepositoryInterface repository
        +create(HotelData) Hotel
    }

    class HotelRepositoryInterface {
        <<interface>>
        +findById(int id) Hotel
        +create(HotelData) Hotel
        +existsByName(string name) bool
    }

    class EloquentHotelRepository {
        -Hotel model
        +findById(int id) Hotel
    }

    class RoomAssignmentService {
        -RoomRepositoryInterface repository
        -AccommodationRuleResolver resolver
        -RoomCapacityValidator capacity
        +assign(int hotelId, RoomAssignmentData) HotelRoom
    }

    class AccommodationRuleResolver {
        -AccommodationRule[] rules
        +resolve(RoomType) AccommodationRule
        +assertValid(RoomType, Accommodation) void
    }

    class AccommodationRule {
        <<interface>>
        +supports(RoomType) bool
        +allowed() array
    }

    class StandardRoomRule {
        +allowed() array
    }
    class JuniorRoomRule {
        +allowed() array
    }
    class SuiteRoomRule {
        +allowed() array
    }

    class Hotel {
        +int id
        +string name
        +string nit
        +int max_rooms
        +rooms() HasMany
        +city() BelongsTo
        +occupiedRooms() int
        +availableRooms() int
    }

    class HotelRoom {
        +int quantity
        +hotel() BelongsTo
        +roomType() BelongsTo
        +accommodation() BelongsTo
    }

    HotelController ..> HotelServiceInterface : depende de
    HotelServiceInterface <|.. HotelService : implementa
    HotelService ..> HotelRepositoryInterface : depende de
    HotelRepositoryInterface <|.. EloquentHotelRepository : implementa
    EloquentHotelRepository ..> Hotel : consulta

    RoomAssignmentService ..> AccommodationRuleResolver : usa
    AccommodationRuleResolver o-- AccommodationRule : contiene
    AccommodationRule <|.. StandardRoomRule
    AccommodationRule <|.. JuniorRoomRule
    AccommodationRule <|.. SuiteRoomRule

    Hotel "1" --> "0..*" HotelRoom : tiene
```

## 4. Secuencia — asignar habitaciones a un hotel

Es la operación con más reglas del sistema, y por eso la que mejor ilustra la
arquitectura. El diagrama muestra los tres puntos donde la petición puede
rechazarse antes de escribir nada.

```mermaid
sequenceDiagram
    autonumber
    actor U as Gerente
    participant R as React
    participant C as RoomController
    participant V as AssignRoomRequest
    participant S as RoomAssignmentService
    participant AR as RuleResolver
    participant CV as CapacityValidator
    participant Repo as RoomRepository
    participant DB as PostgreSQL

    U->>R: Completa cantidad, tipo y acomodación
    R->>R: Valida con Zod (feedback inmediato)
    R->>C: POST /api/v1/hotels/7/rooms

    C->>V: Valida forma de la petición
    alt Datos mal formados
        V-->>R: 422 · errores por campo
        R-->>U: Resalta el campo con error
    end

    V-->>C: RoomAssignmentData (DTO)
    C->>S: assign(7, dto)

    S->>DB: BEGIN TRANSACTION
    S->>DB: SELECT FROM hotels WHERE id=7 FOR UPDATE
    Note over S,DB: Bloqueo pesimista: evita que dos peticiones<br/>simultáneas superen el tope de habitaciones

    S->>AR: assertValid(Junior, Sencilla)
    AR->>AR: Selecciona JuniorRoomRule
    alt Acomodación no permitida para el tipo
        AR-->>S: InvalidAccommodationException
        S->>DB: ROLLBACK
        S-->>R: 422 · "Junior sólo admite Triple o Cuádruple"
    end

    S->>Repo: existsCombination(7, Junior, Triple)
    alt Combinación ya configurada
        Repo-->>S: true
        S->>DB: ROLLBACK
        S-->>R: 409 · "Esa configuración ya existe en el hotel"
    end

    S->>CV: assertFits(hotel, 12)
    CV->>Repo: sumQuantities(7)
    Repo-->>CV: 37 ocupadas de 42
    alt 37 + 12 excede 42
        CV-->>S: RoomCapacityExceededException
        S->>DB: ROLLBACK
        S-->>R: 422 · "Sólo quedan 5 habitaciones disponibles"
    end

    S->>Repo: create(dto)
    Repo->>DB: INSERT INTO hotel_rooms
    S->>DB: COMMIT

    Repo-->>S: HotelRoom
    S-->>C: HotelRoom
    C-->>R: 201 · HotelRoomResource
    R->>R: Invalida caché de TanStack Query
    R-->>U: Tabla actualizada y contador de disponibles
```

## 5. Estructura de carpetas del backend

```
backend/app/
├── Domain/                        # Núcleo: no depende de framework ni de HTTP
│   ├── Hotel/
│   │   ├── Data/                  # DTOs inmutables
│   │   ├── Exceptions/            # Excepciones de dominio
│   │   ├── Repositories/          # Interfaces (contratos)
│   │   ├── Rules/                 # Strategies de acomodación
│   │   └── Services/              # Lógica de negocio
│   └── Shared/
├── Http/                          # Frontera HTTP: delgada por diseño
│   ├── Controllers/Api/V1/
│   ├── Requests/                  # Validación de entrada
│   ├── Resources/                 # Serialización de salida
│   └── Middleware/
├── Infrastructure/                # Detalles reemplazables
│   └── Persistence/Eloquent/      # Implementación de los repositorios
├── Models/
└── Providers/                     # Enlace interfaz -> implementación
```

La regla que gobierna esta estructura: **las dependencias apuntan hacia adentro**.
`Domain` no importa nada de `Http` ni de `Infrastructure`. Se puede exponer el
mismo dominio por CLI, por cola de trabajos o por GraphQL sin tocar una línea de
lógica de negocio.
