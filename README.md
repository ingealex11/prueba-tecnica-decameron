# Sistema de Gestión Hotelera — Decameron Colombia

[![CI](https://github.com/ingealex11/prueba-tecnica-decameron/actions/workflows/ci.yml/badge.svg)](https://github.com/ingealex11/prueba-tecnica-decameron/actions/workflows/ci.yml)
![PHP](https://img.shields.io/badge/PHP-8.2%20%7C%208.3-777BB4)
![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1)
![Pruebas](https://img.shields.io/badge/pruebas-163%20en%20verde-success)
![OpenAPI](https://img.shields.io/badge/OpenAPI-3.1-6BA539)

Aplicación web para administrar el inventario de hoteles de Hoteles Decameron de
Colombia y la configuración de habitaciones de cada uno, haciendo cumplir por
diseño las reglas de negocio del enunciado.

Además de lo que pide el enunciado, incluye **autenticación en dos pasos**,
**mapa de sedes** sobre OpenStreetMap, **panel con indicadores**,
**documentación OpenAPI interactiva** generada desde el código y **modo oscuro**.

> **¿Sólo quiere ver cómo se instala?** Vaya directo a
> **[INSTALL.md](INSTALL.md)**, escrito paso a paso y sin dar nada por sabido.

---

## Contenido

- [El problema](#el-problema)
- [Cómo verlo funcionando](#cómo-verlo-funcionando)
- [Arquitectura](#arquitectura)
- [Patrones de diseño](#patrones-de-diseño)
- [Principios SOLID](#principios-solid)
- [La API](#la-api)
- [Base de datos](#base-de-datos)
- [Seguridad](#seguridad)
- [Pruebas](#pruebas)
- [Integración continua](#integración-continua)
- [Diseño responsive](#diseño-responsive)
- [Metodología](#metodología)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Cumplimiento del enunciado](#cumplimiento-del-enunciado)

---

## El problema

El gerente de operaciones hoteleras necesita registrar los hoteles de la
compañía con sus datos básicos y tributarios, y asignar a cada uno tipos de
habitación con su acomodación. El sistema debe impedir configuraciones
inválidas, no detectarlas después.

### La regla central

| Tipo de habitación | Sencilla | Doble | Triple | Cuádruple |
|--------------------|:--------:|:-----:|:------:|:---------:|
| **Estándar**       | ✅        | ✅     | ❌      | ❌         |
| **Junior**         | ❌        | ❌     | ✅      | ✅         |
| **Suite**          | ✅        | ✅     | ✅      | ❌         |

### Criterios de aceptación

| # | Criterio del enunciado | Dónde se cumple |
|---|------------------------|-----------------|
| 1 | La cantidad de habitaciones configuradas no supera el máximo del hotel | `RoomCapacityValidator`, en transacción con bloqueo |
| 2 | No existen hoteles repetidos | Índices únicos parciales + `StoreHotelRequest` |
| 3 | No se repite tipo + acomodación en un mismo hotel | Índice único compuesto + `RoomAssignmentService` |
| 4 | Los catálogos no requieren administración | `CatalogRepositoryInterface` sólo expone lectura |
| 5 | Uso en portátiles de 13 y 15 pulgadas | Diseño verificado en 1280×800 y 1440×900 |

---

## Cómo verlo funcionando

### En la nube

| Componente | Dirección |
|------------|-----------|
| Aplicación | _(pendiente de despliegue)_ |
| API        | _(pendiente de despliegue)_ |

### En su equipo

Requiere PHP 8.2+, Composer, Node 20+ y PostgreSQL 17.

```bash
git clone https://github.com/ingealex11/prueba-tecnica-decameron.git
cd prueba-tecnica-decameron

# --- Backend ---
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve                 # http://localhost:8000

# --- Frontend, en otra terminal ---
cd frontend
npm install
cp .env.example .env
npm run dev                       # http://localhost:5173
```

La guía detallada, con la instalación de cada requisito y qué hacer si algo
falla, está en **[INSTALL.md](INSTALL.md)**.

La base de datos queda poblada con el hotel del ejemplo del enunciado
—Decameron Cartagena, 42 habitaciones repartidas en 25 + 12 + 5— y otros tres
que ilustran distintos estados de la interfaz, todos situados en el mapa.

### Credenciales de demostración

| Correo | Contraseña |
|--------|------------|
| `gerente@decameron.test` | `decameron2026` |

Tras las credenciales se pide un código de verificación de seis dígitos. En la
instancia de demostración ese código **se muestra en pantalla** en lugar de
enviarse por SMS, para que pueda probarse sin bandeja de correo; la
verificación en el servidor es la misma que en producción.

### Documentación interactiva de la API

Con el backend en marcha: <http://localhost:8000/docs/api>. Se genera desde el
código en cada petición, así que no puede quedarse desactualizada. Permite
probar cada endpoint desde el navegador.

---

## Arquitectura

Backend y frontend son aplicaciones independientes, con su propio ciclo de vida
y su propio despliegue. El único contrato entre ellas es HTTP con JSON.

```
┌─────────────────────────┐         ┌──────────────────────────────┐
│  React 19 + TypeScript  │  REST   │     Laravel 12 · API v1      │
│  Vite · Tailwind        │ ──────▶ │                              │
│  TanStack Query         │  JSON   │  Controller → FormRequest    │
│  React Hook Form + Zod  │ ◀────── │       ↓                      │
└─────────────────────────┘         │      DTO → Service           │
                                    │             ↓                │
                                    │      Repository (interfaz)   │
                                    │             ⋮ inyección      │
                                    │      EloquentRepository      │
                                    └──────────────┬───────────────┘
                                                   │
                                            ┌──────▼───────┐
                                            │ PostgreSQL 17│
                                            └──────────────┘
```

### Capas del backend

```
backend/app/
├── Domain/                    # Núcleo: no conoce HTTP ni el framework
│   ├── Hotel/
│   │   ├── Data/              # DTOs inmutables
│   │   ├── Exceptions/        # Violaciones de reglas de negocio
│   │   ├── Repositories/      # Interfaces (contratos)
│   │   ├── Rules/             # Strategies de acomodación
│   │   └── Services/          # Lógica de negocio
│   └── Shared/
├── Http/                      # Frontera HTTP, delgada por diseño
│   ├── Controllers/Api/V1/
│   ├── Requests/              # Validación de entrada
│   ├── Resources/             # Serialización de salida
│   ├── Middleware/
│   └── Responses/
├── Infrastructure/            # Detalles reemplazables
│   └── Persistence/Eloquent/
├── Exceptions/                # Traducción a respuestas JSON
├── Models/
└── Providers/                 # Enlace interfaz → implementación
```

**Las dependencias apuntan hacia adentro.** `Domain` no importa nada de `Http`
ni de `Infrastructure`, de modo que el mismo núcleo podría exponerse por
consola, por una cola de trabajos o por GraphQL sin tocar una línea de lógica.

### Dos niveles de validación

La distinción es deliberada y recorre todo el proyecto:

| | Pregunta que responde | Ejemplos |
|---|---|---|
| **`FormRequest`** | ¿Está bien formada la petición? | Campos obligatorios, tipos, formato del NIT |
| **`Service`** | ¿Tiene sentido en el dominio? | Acomodación válida para el tipo, capacidad disponible |

Implementar las reglas de negocio en el `FormRequest` sería más corto, pero
entonces sólo se aplicarían a peticiones HTTP: una carga masiva por consola las
eludiría por completo.

### Diagramas

- [Modelo de datos y reglas](docs/uml/01-modelo-datos.md) — entidad-relación, matriz de combinaciones, índices
- [Arquitectura](docs/uml/02-arquitectura.md) — componentes, clases del dominio, secuencia de asignación

---

## Patrones de diseño

Un patrón sin motivo es complejidad gratuita. Cada uno de estos resuelve un
problema concreto de este sistema.

### Strategy — reglas de acomodación

Cada tipo de habitación tiene su clase de regla; un resolutor elige la que
corresponde en tiempo de ejecución.

```php
interface AccommodationRule
{
    public function supports(string $roomTypeSlug): bool;

    /** @return list<string> */
    public function allowedAccommodations(): array;
}
```

**Por qué:** incorporar un tipo nuevo es crear una clase y registrarla en
`config/hotel.php`. Ningún archivo existente se modifica, así que ninguna regla
ya probada puede romperse por accidente. [Hay una prueba que lo
demuestra](backend/tests/Unit/Domain/AccommodationRulesTest.php): registra un
tipo «Presidencial» y comprueba que las reglas originales siguen intactas.

📁 `app/Domain/Hotel/Rules/`

### Repository — persistencia abstraída

El dominio declara qué necesita de la persistencia; la infraestructura lo
implementa con Eloquent, y el enlace vive en un único proveedor.

**Por qué:** la lógica de negocio se prueba con dobles, sin base de datos y en
milisegundos. Cambiar de motor o de ORM no obliga a tocar el dominio.

📁 `app/Domain/Hotel/Repositories/` → `app/Infrastructure/Persistence/Eloquent/`

### Service Layer — reglas fuera del controlador

**Por qué:** las mismas reglas se aplican venga la petición de HTTP, de consola
o de una cola. El controlador se limita a traducir el transporte.

📁 `app/Domain/Hotel/Services/`

### Data Transfer Object — datos tipados entre capas

**Por qué:** la firma de un método dice qué recibe, en lugar de aceptar arrays
cuyo contenido sólo se descubre leyendo el cuerpo. Son inmutables, así que
ninguna capa intermedia puede alterarlos sin que las demás se enteren.

📁 `app/Domain/Hotel/Data/`

### Resource / Presenter — frontera de salida

**Por qué:** el contrato público de la API no queda atado al esquema de la
tabla. Renombrar una columna no rompe a los clientes, y una columna nueva no
queda expuesta sin que nadie lo decida.

📁 `app/Http/Resources/Api/V1/`

### Dependency Injection — un solo punto de enlace

**Por qué:** sustituir una implementación, en producción o en una prueba, es un
cambio de una línea.

📁 `app/Providers/DomainServiceProvider.php`

---

## Principios SOLID

| | Principio | Cómo se aplica aquí |
|---|---|---|
| **S** | Responsabilidad Única | `RoomCapacityValidator` sólo valida capacidad; `AccommodationRuleResolver` sólo decide acomodaciones. Se separaron porque la regla de capacidad se aplica desde dos casos de uso distintos y debía poder probarse sin montar ninguno. |
| **O** | Abierto / Cerrado | Un tipo de habitación nuevo es una clase nueva. [Probado explícitamente](backend/tests/Unit/Domain/AccommodationRulesTest.php). |
| **L** | Sustitución de Liskov | Cualquier implementación de los repositorios es intercambiable; las pruebas unitarias lo aprovechan sustituyéndolos por dobles. |
| **I** | Segregación de Interfaces | `CatalogRepositoryInterface` expone sólo lectura, porque el enunciado descarta administrar catálogos. La regla queda en el contrato, no en una convención. |
| **D** | Inversión de Dependencias | Los servicios dependen de interfaces del dominio, nunca de Eloquent. |

---

## La API

RESTful, versionada bajo `/api/v1`, con verbos y códigos de estado semánticos.

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/v1/auth/login` | Paso 1: credenciales. Emite un desafío, no un token |
| `POST` | `/api/v1/auth/verify` | Paso 2: código de verificación. Emite el token |
| `GET` | `/api/v1/auth/me` | Persona autenticada |
| `POST` | `/api/v1/auth/logout` | Revoca el token actual |
| `GET` | `/api/v1/hotels` | Listado con búsqueda, filtro por ciudad, orden y paginación |
| `POST` | `/api/v1/hotels` | Registrar hotel |
| `GET` | `/api/v1/hotels/{id}` | Detalle con sus habitaciones |
| `PUT` | `/api/v1/hotels/{id}` | Actualizar |
| `DELETE` | `/api/v1/hotels/{id}` | Dar de baja |
| `GET` | `/api/v1/hotels/{id}/rooms` | Configuraciones del hotel |
| `POST` | `/api/v1/hotels/{id}/rooms` | Asignar habitaciones |
| `PUT` | `/api/v1/hotels/{id}/rooms/{roomId}` | Modificar una configuración |
| `DELETE` | `/api/v1/hotels/{id}/rooms/{roomId}` | Eliminar una configuración |
| `GET` | `/api/v1/catalogs/cities` | Ciudades |
| `GET` | `/api/v1/catalogs/room-types` | Tipos con sus acomodaciones válidas |
| `GET` | `/api/v1/catalogs/accommodations` | Acomodaciones |

### Formato de las respuestas

Toda respuesta comparte la misma envoltura, tenga éxito o falle, de modo que el
cliente pueda comprobarlo una sola vez en un interceptor.

**Éxito**

```json
{
  "success": true,
  "message": "Hotel registrado correctamente.",
  "data": { "id": 1, "name": "Decameron Cartagena", "occupied_rooms": 42, "available_rooms": 0 },
  "meta": { "pagination": { "current_page": 1, "per_page": 15, "total": 4 } }
}
```

**Error**

```json
{
  "success": false,
  "message": "La acomodación \"Sencilla\" no es válida para el tipo de habitación \"Junior\". Opciones permitidas: Triple, Cuádruple.",
  "error_code": "INVALID_ACCOMMODATION_FOR_ROOM_TYPE",
  "errors": { "accommodation_id": ["La acomodación \"Sencilla\" no es válida…"] },
  "meta": { "allowed_accommodations": ["Triple", "Cuádruple"] }
}
```

El campo `meta` no es decorativo: al rechazar por capacidad indica cuántas
habitaciones quedan disponibles, de modo que el usuario sepa qué cantidad sí
puede registrar en lugar de tener que probar por ensayo y error.

### Códigos de estado

| Código | Cuándo |
|--------|--------|
| `200` / `201` / `204` | Operación correcta |
| `404` | El recurso no existe |
| `409` | Conflicto con el estado actual: la combinación tipo + acomodación ya existe |
| `422` | Datos semánticamente inválidos: acomodación incorrecta, capacidad superada |
| `429` | Se superó el límite de peticiones |

La distinción entre `409` y `422` es intencionada: una combinación repetida es
una petición perfectamente formada que choca con el estado del recurso, y la
acción correcta del cliente es editar lo existente, no corregir los datos.

📮 [Colección de Postman](docs/api/decameron.postman_collection.json)

---

## Base de datos

PostgreSQL 17. La estrategia es de **doble barrera**: cada regla vive en la
aplicación, con mensajes legibles, y en el motor, que es lo único que resiste
escrituras concurrentes o accesos externos.

### Esquema

```
cities ──┐
         └──< hotels ──< hotel_rooms >── room_types ──┐
                                    └── accommodations ┘
                                                       │
                             room_type_accommodation ──┘
                             (matriz de combinaciones válidas)
```

### Decisiones destacadas

**Índices únicos parciales.** La unicidad de nombre y NIT aplica sólo a los
hoteles activos:

```sql
CREATE UNIQUE INDEX hotels_name_unique_active
    ON hotels (name) WHERE deleted_at IS NULL;
```

Un `UNIQUE` corriente abarcaría también las filas con borrado lógico, y entonces
el nombre de un hotel retirado quedaría bloqueado para siempre: la aplicación
aceptaría reutilizarlo y la base de datos lo rechazaría. *Este fallo lo destapó
una prueba automatizada.*

**Bloqueo pesimista.** Validar la capacidad es un leer-modificar-escribir. Sin
protección, dos peticiones simultáneas podrían superar juntas el máximo entre la
lectura y la escritura, así que la asignación toma `SELECT … FOR UPDATE` sobre la
fila del hotel dentro de la transacción.

**El catálogo se deriva del dominio.** La tabla `room_type_accommodation` no se
escribe a mano: el seeder la construye preguntando a las reglas del dominio. Así
hay una única fuente de verdad, y el frontend puede consultar las combinaciones
válidas en lugar de duplicar la regla.

**El NIT es texto.** Puede llevar ceros a la izquierda y guion de dígito de
verificación; un tipo numérico perdería ambos.

### Dumps

| Archivo | Contenido |
|---------|-----------|
| [`schema.sql`](database/dump/schema.sql) | Sólo estructura |
| [`seed.sql`](database/dump/seed.sql) | Sólo datos |
| [`decameron_completo.sql`](database/dump/decameron_completo.sql) | Estructura y datos, listo para restaurar |

```bash
createdb -U postgres decameron
psql -U postgres -d decameron -f database/dump/decameron_completo.sql
```

---

## Seguridad

Defensa en profundidad: ninguna medida basta por sí sola, y el objetivo es que
un fallo en una capa no comprometa el sistema entero.

| Riesgo | Medida |
|--------|--------|
| Acceso con contraseña robada | Autenticación en dos pasos: el código se guarda cifrado, caduca a los cinco minutos, se consume al usarse y se invalida tras cinco intentos |
| Enumeración de cuentas | La contraseña se compara también cuando el correo no existe, contra un hash ficticio, para que el tiempo de respuesta no delate qué cuentas hay |
| Inyección SQL | Consultas parametrizadas vía Eloquent. El ordenamiento, que sí acaba interpolado en `ORDER BY`, se restringe a una lista cerrada de columnas |
| Cross-site scripting | React escapa por defecto; no se usa inserción directa de HTML en ningún punto |
| Validación eludida | Doble validación: el cliente para responder rápido, el servidor porque es lo único que el usuario no controla |
| Acceso no autorizado | Sanctum sobre los endpoints de escritura, activable con `API_AUTH_ENABLED` |
| Abuso de la API | Límite por minuto y por IP, más estricto en escritura que en lectura |
| Origen no confiable | CORS restringido a los orígenes declarados, nunca comodín |
| Clickjacking, sniffing | `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`; HSTS bajo HTTPS |
| Referencia directa insegura | Las rutas anidadas comprueban la pertenencia: no se puede tocar la configuración de un hotel usando el id de otro |
| Fuga de información | En producción los errores inesperados no revelan mensajes internos ni trazas |
| Secretos expuestos | Credenciales en variables de entorno; sólo las variables `VITE_` llegan al navegador |

> **Sobre la autenticación.** El enunciado no pide login. El panel web exige
> iniciar sesión en dos pasos; los endpoints de hoteles de la API, en cambio,
> se entregan sin exigir token para que puedan evaluarse desde la
> documentación sin credenciales. Activar la exigencia de token en ellos es
> cambiar `API_AUTH_ENABLED=true`.

---

## Pruebas

**163 pruebas automatizadas**, ejecutadas contra PostgreSQL real.

### Backend — 113 pruebas, 291 aserciones

```bash
cd backend && composer test
```

*Unitarias, sin base de datos:*

- Las **doce combinaciones posibles** de tipo y acomodación: las siete válidas y las cinco inválidas. Probar sólo las válidas dejaría sin verificar el rechazo, que es justo lo que exige el enunciado.
- Casos frontera de capacidad: llegar exactamente al máximo (válido) y excederlo por una sola habitación (rechazado).
- Extensibilidad: se registra un tipo nuevo sin modificar código existente.

*De integración, API completa contra PostgreSQL:*

- Ciclo completo de hoteles con todos sus casos de rechazo.
- Las tres reglas desde HTTP, incluida la comprobación de que el ejemplo del enunciado cuadra: 25 + 12 + 5 = 42.
- Protección contra manipular la configuración de un hotel a través de otro.
- Los catálogos no exponen ningún endpoint de escritura.
- El flujo de autenticación completo: sin token tras el paso 1, código cifrado, caducidad, consumo único, bloqueo por intentos y cierre de sesión que revoca sólo el token actual.

### Frontend — 50 pruebas

```bash
cd frontend && npm test
```

- El selector de acomodación se limita según el tipo elegido, y descarta la selección si deja de ser válida al cambiar de tipo.
- Las combinaciones ya configuradas quedan bloqueadas, salvo la que se está editando.
- El indicador de capacidad, incluidos los estados imposibles que deben degradar con sensatez.
- La normalización de errores de la API, incluida la respuesta que no sigue el contrato.
- La entrada del código de verificación: avance y retroceso del foco, pegado del código completo y envío automático al sexto dígito.

### Por qué PostgreSQL y no SQLite en memoria

Sería más rápido, pero el esquema usa restricciones `CHECK` e índices únicos
parciales, y las consultas el operador `ILIKE`. Sobre otro motor unas fallarían y
otras se comportarían distinto: una suite verde no diría nada del comportamiento
real en producción.

---

## Integración continua

[GitHub Actions](.github/workflows/ci.yml) verifica cada `push` y cada
`pull request`:

| Trabajo | Comprueba |
|---------|-----------|
| **Backend** (PHP 8.2 y 8.3) | Estilo con Pint · Análisis estático con Larastan nivel 6 · 113 pruebas contra PostgreSQL 17 · cobertura mínima del 70 % |
| **Frontend** | Estilo · Comprobación de tipos · 50 pruebas · Compilación de producción |

PHPStan se configura **sin `ignoreErrors` ni fichero de línea base**: silenciar
un error del análisis estático es aplazarlo, no resolverlo.

```bash
cd backend  && composer check   # estilo, análisis y pruebas
cd frontend && npm run check    # estilo, tipos, pruebas y compilación
```

---

## Diseño responsive

El enunciado precisa que los gerentes usan portátiles de 13 y algunos de 15
pulgadas, así que ésas son las medidas de referencia y no una idea general de
«que se vea bien».

| Ancho | Presentación |
|-------|--------------|
| ≥ 1024 px (13″ y 15″) | Tabla completa, que es lo que permite comparar filas |
| 768–1023 px | Tabla reducida en habitaciones, tarjetas en hoteles |
| < 768 px | Tarjetas apiladas |

Los listados **nunca se desplazan en horizontal**: por debajo del umbral cambian
a tarjetas. Una tabla de cinco columnas en una pantalla estrecha obliga a
desplazarse lateralmente para leer cada fila.

Verificado en Chrome y Firefox a 1280×800 y 1440×900.

### Accesibilidad

- Diálogos sobre el elemento nativo `<dialog>`, que ya resuelve foco atrapado, cierre con Escape y retorno del foco.
- Campos con etiqueta asociada y errores enlazados por `aria-describedby`, anunciados al llegar al control.
- El color nunca es el único portador de información: la capacidad se muestra siempre también en cifras.
- Contorno de foco visible y respeto por `prefers-reduced-motion`.

---

## Metodología

Trabajo organizado con SCRUM adaptado a dos sprints cortos. El
[product backlog](docs/scrum/product-backlog.md) recoge trece historias de
usuario con criterios de aceptación verificables, la *definition of done* y la
trazabilidad de cada criterio del enunciado con la historia que lo cubre.

El historial de Git usa [Conventional Commits](https://www.conventionalcommits.org/es/),
y los mensajes explican **por qué** se hizo cada cambio, no sólo qué cambió.

---

## Estructura del repositorio

```
prueba-tecnica-decameron/
├── .github/workflows/ci.yml     Integración continua
├── backend/                     API Laravel 12
│   ├── app/Domain/              Núcleo de negocio
│   ├── app/Http/                Frontera HTTP
│   ├── app/Infrastructure/      Persistencia
│   ├── database/                Migraciones, seeders, factories
│   └── tests/                   96 pruebas
├── frontend/                    Aplicación React 19
│   └── src/
│       ├── app/                 Armazón, rutas, cliente de consultas
│       ├── features/            Organización por funcionalidad
│       ├── shared/              API, componentes y utilidades comunes
│       └── test/                Utilidades de prueba
├── database/dump/               Dumps listos para restaurar
├── docs/
│   ├── uml/                     Diagramas
│   ├── scrum/                   Backlog e historias
│   └── api/                     Colección de Postman
├── INSTALL.md                   Guía de instalación paso a paso
└── README.md
```

---

## Cumplimiento del enunciado

| Requisito | Estado |
|-----------|:------:|
| Ingreso de hoteles con datos básicos y tributarios | ✅ |
| Asignación de tipos de habitación y acomodaciones | ✅ |
| Validación de acomodación según tipo | ✅ |
| Las habitaciones configuradas no superan el máximo | ✅ |
| No existen hoteles repetidos | ✅ |
| No se repite tipo + acomodación por hotel | ✅ |
| Catálogos sin administración | ✅ |
| Aplicación totalmente RESTful | ✅ |
| Backend y frontend desacoplados | ✅ |
| Backend en PHP | ✅ |
| Base de datos PostgreSQL | ✅ |
| Documentación con diagramas UML | ✅ |
| Repositorio Git público | ✅ |
| Dump de la base de datos | ✅ |
| Guía de despliegue paso a paso | ✅ |
| Uso en Firefox y Chrome | ✅ |
| Portátiles de 13 y 15 pulgadas | ✅ |
| Patrones de diseño, SOLID, código documentado | ✅ |
| Framework de frontend (React) | ✅ |
| Framework PHP (Laravel) | ✅ |
| Integración continua | ✅ |
| Pruebas unitarias | ✅ |
| Despliegue en la nube con enlace | ⏳ |

### Añadido por iniciativa propia

| Extra | Dónde |
|-------|-------|
| Autenticación en dos pasos con código de verificación | `app/Domain/Auth/` · `/login` |
| Ubicación de cada hotel en el mapa, con geocodificación de la dirección | `hotels.latitude/longitude` · `/app/mapa` |
| Panel con indicadores de ocupación | `/app` |
| Documentación OpenAPI 3.1 interactiva, generada desde el código | `/docs/api` |
| Modo claro y oscuro con sistema de diseño por tokens | `frontend/src/styles/index.css` |

---

<div align="center">

**Prueba técnica** · Hoteles Decameron de Colombia · Dirección de Desarrollo

</div>
