/**
 * Contenido de la página de presentación.
 *
 * Está escrito en primera persona porque es mi trabajo y lo explico yo. Se
 * mantiene separado de los componentes para que la página sea un problema de
 * maquetación y no una mezcla de texto y marcado.
 */

export interface TechItem {
  name: string
  version: string
  role: string
}

export interface PatternItem {
  name: string
  what: string
  why: string
  where: string
}

export interface PrincipleItem {
  letter: string
  name: string
  applied: string
}

export interface Item {
  title: string
  detail: string
}

/** Reglas de acomodación del enunciado, para mostrarlas como matriz. */
export const ACCOMMODATION_MATRIX = {
  accommodations: ['Sencilla', 'Doble', 'Triple', 'Cuádruple'],
  types: [
    { name: 'Estándar', allowed: [true, true, false, false] },
    { name: 'Junior', allowed: [false, false, true, true] },
    { name: 'Suite', allowed: [true, true, true, false] },
  ],
} as const

export const HERO = {
  eyebrow: 'Prueba técnica · Desarrollador PHP · Hoteles Decameron',
  title: 'Sistema de gestión de hoteles y configuración de habitaciones.',
  lead:
    'El enunciado pedía un CRUD de hoteles y habitaciones con tres reglas de negocio. Lo resolví con una API REST documentada, un panel con autenticación en dos pasos y mapa de sedes, y 163 pruebas automatizadas que cubren cada una de las reglas. En esta página explico qué se pidió, qué decidí y por qué, y cómo ponerlo en marcha.',
}

export const CHALLENGE: Item[] = [
  { title: 'Hoteles sin duplicar', detail: 'Nombre y NIT únicos en toda la compañía.' },
  { title: 'Acomodación acorde al tipo', detail: 'Cada tipo de habitación admite unas acomodaciones concretas y ninguna otra.' },
  { title: 'Sin combinaciones repetidas', detail: 'Un hotel no puede tener dos veces el mismo tipo con la misma acomodación.' },
  { title: 'Capacidad respetada', detail: 'La suma de habitaciones configuradas nunca supera el máximo del hotel.' },
  { title: 'Catálogos sin administración', detail: 'Ciudades, tipos y acomodaciones son datos fijos, sin pantallas de gestión.' },
  { title: 'Portátiles de 13 y 15 pulgadas', detail: 'Diseñé y verifiqué la interfaz en 1280×800 y 1440×900, el equipo real de los gerentes.' },
]

export const EXTRAS: Item[] = [
  { title: 'Autenticación en dos pasos', detail: 'Credenciales y después un código de seis dígitos que caduca, se consume al usarse y se bloquea tras cinco intentos.' },
  { title: 'Mapa de sedes', detail: 'Cada hotel se sitúa sobre OpenStreetMap; la dirección se geocodifica desde el formulario y el marcador se afina arrastrándolo.' },
  { title: 'Documentación OpenAPI viva', detail: 'La especificación se genera desde el código en cada petición. No puede quedarse desactualizada.' },
  { title: 'Panel con indicadores', detail: 'Ocupación global, sedes completas y sin configurar, todo de un vistazo.' },
  { title: 'Modo oscuro', detail: 'Sistema de diseño por tokens semánticos: el tema cambia sin tocar un solo componente.' },
  { title: 'Accesibilidad real', detail: 'Diálogos nativos, foco visible, errores anunciados y ningún dato transmitido sólo por color.' },
]

export const BACKEND_STACK: TechItem[] = [
  { name: 'PHP', version: '8.2', role: 'Tipado estricto y clases de sólo lectura en todo el dominio.' },
  { name: 'Laravel', version: '12', role: 'Contenedor de dependencias, Eloquent, validación y Sanctum.' },
  { name: 'PostgreSQL', version: '17', role: 'CHECK, índices únicos parciales y UPDATE condicional atómico.' },
  { name: 'Scramble + Scalar', version: '0.13', role: 'OpenAPI 3.1 generado desde el código, con consola interactiva.' },
  { name: 'Pest', version: '4', role: '113 pruebas unitarias y de integración contra PostgreSQL real.' },
  { name: 'Larastan', version: '3', role: 'Análisis estático en nivel 6, sin errores silenciados.' },
]

export const FRONTEND_STACK: TechItem[] = [
  { name: 'React', version: '19', role: 'Componentes por funcionalidad y carga diferida por ruta.' },
  { name: 'TypeScript', version: '6', role: 'El contrato de la API tipado de extremo a extremo.' },
  { name: 'Vite', version: '8', role: 'Desarrollo instantáneo y compilación optimizada.' },
  { name: 'TanStack Query', version: '5', role: 'Caché, revalidación tras cada escritura y reintentos con criterio.' },
  { name: 'Tailwind CSS', version: '4', role: 'Sistema de diseño por tokens con modo oscuro.' },
  { name: 'Leaflet', version: '1.9', role: 'Mapas sobre OpenStreetMap, sin claves ni cuotas.' },
  { name: 'Vitest + Testing Library', version: '5 · 16', role: '50 pruebas de comportamiento, no de implementación.' },
]

export const PATTERNS: PatternItem[] = [
  {
    name: 'Strategy',
    what: 'Cada tipo de habitación tiene su propia clase de regla y un resolutor elige la que corresponde.',
    why: 'Añadir un tipo nuevo es crear una clase, sin tocar ninguna existente. Escribí una prueba que lo demuestra registrando un tipo «Presidencial».',
    where: 'AccommodationRule · StandardRoomRule · JuniorRoomRule · SuiteRoomRule',
  },
  {
    name: 'Repository',
    what: 'El dominio declara interfaces de persistencia; la infraestructura las implementa con Eloquent.',
    why: 'Pruebo la lógica de negocio con dobles, sin base de datos, y podría cambiar el ORM sin tocar el dominio.',
    where: 'HotelRepositoryInterface → EloquentHotelRepository',
  },
  {
    name: 'Service Layer',
    what: 'Las reglas viven en servicios; los controladores sólo traducen HTTP.',
    why: 'Las mismas reglas se aplican venga la petición de HTTP, de consola o de una cola de trabajos.',
    where: 'HotelService · RoomAssignmentService · AuthService',
  },
  {
    name: 'Data Transfer Object',
    what: 'Objetos inmutables transportan los datos entre capas.',
    why: 'La firma de cada método dice qué recibe; nadie tiene que leer el cuerpo para adivinar el contenido de un array.',
    where: 'HotelData · RoomAssignmentData · TwoFactorIssued',
  },
  {
    name: 'Dependency Injection',
    what: 'Un único proveedor enlaza cada interfaz con su implementación.',
    why: 'Sustituir una implementación, en producción o en una prueba, es cambiar una línea.',
    where: 'DomainServiceProvider',
  },
  {
    name: 'Resource / Presenter',
    what: 'Clases dedicadas deciden exactamente qué expone la API.',
    why: 'El contrato público no queda atado al esquema de la tabla, y ningún atributo sensible se filtra por descuido.',
    where: 'HotelResource · UserResource · RoomTypeResource',
  },
]

export const SOLID: PrincipleItem[] = [
  { letter: 'S', name: 'Responsabilidad única', applied: 'RoomCapacityValidator sólo valida capacidad; AccommodationRuleResolver sólo decide acomodaciones. Los separé porque la regla de capacidad se aplica desde dos casos de uso y debía probarse sin montar ninguno.' },
  { letter: 'O', name: 'Abierto / cerrado', applied: 'Un tipo de habitación nuevo es una clase nueva registrada en configuración. Lo verifica una prueba que añade un tipo y comprueba que los existentes no cambian.' },
  { letter: 'L', name: 'Sustitución de Liskov', applied: 'Cualquier implementación de los repositorios es intercambiable; las pruebas unitarias lo aprovechan sustituyéndolos por dobles.' },
  { letter: 'I', name: 'Segregación de interfaces', applied: 'CatalogRepositoryInterface expone sólo lectura porque el enunciado descarta administrar catálogos. La regla queda en el contrato, no en una convención.' },
  { letter: 'D', name: 'Inversión de dependencias', applied: 'Los servicios dependen de interfaces del dominio, nunca de Eloquent. Las dependencias apuntan hacia el núcleo, no hacia el framework.' },
]

export const SECURITY: Item[] = [
  { title: 'Autenticación en dos pasos', detail: 'Tras la contraseña se pide un código de verificación, que se guarda cifrado, caduca a los cinco minutos, se consume al usarse y se invalida tras cinco fallos.' },
  { title: 'Sin fugas por tiempo de respuesta', detail: 'Comparo la contraseña incluso cuando el correo no existe, contra un hash ficticio, para que la latencia no delate qué cuentas hay.' },
  { title: 'Inyección SQL', detail: 'Consultas parametrizadas vía Eloquent. El ordenamiento, que sí se interpola en ORDER BY, se restringe a una lista cerrada de columnas.' },
  { title: 'Cross-site scripting', detail: 'React escapa por defecto y no uso inserción directa de HTML en ningún punto.' },
  { title: 'Referencias directas inseguras', detail: 'Las rutas anidadas comprueban la pertenencia: no se puede tocar la configuración de un hotel usando el id de otro.' },
  { title: 'Límite de peticiones', detail: 'Cinco intentos de inicio de sesión por minuto y por IP; cuotas distintas para lectura y escritura en el resto.' },
  { title: 'CORS y cabeceras', detail: 'Orígenes declarados explícitamente, nunca comodín. nosniff, X-Frame-Options, Referrer-Policy y HSTS bajo HTTPS.' },
  { title: 'Sin información en los errores', detail: 'En producción los fallos inesperados no revelan mensajes internos, rutas ni trazas.' },
  { title: 'Secretos fuera del código', detail: 'Todo en variables de entorno; al navegador sólo llegan las prefijadas con VITE_.' },
]

export const PERSISTENCE: Item[] = [
  { title: 'Doble barrera de integridad', detail: 'Cada regla vive en la aplicación, con mensajes legibles, y en el motor, que es lo único que resiste escrituras concurrentes.' },
  { title: 'Índices únicos parciales', detail: 'La unicidad de nombre y NIT aplica sólo a hoteles activos (WHERE deleted_at IS NULL). Una prueba destapó que sin esto el nombre de un hotel dado de baja quedaba bloqueado para siempre.' },
  { title: 'Bloqueo pesimista', detail: 'Asignar habitaciones bloquea la fila del hotel dentro de la transacción; dos peticiones simultáneas no pueden superar juntas el máximo.' },
  { title: 'UPDATE condicional atómico', detail: 'El código de verificación se consume con un UPDATE que sólo afecta la fila si nadie la consumió antes. Dos envíos con el mismo código: uno entra, el otro falla.' },
  { title: 'El catálogo se deriva del dominio', detail: 'La tabla de combinaciones válidas la construye el seeder preguntando a las reglas. Una sola fuente de verdad; el frontend la consulta en lugar de duplicarla.' },
  { title: 'Coordenadas exactas', detail: 'Latitud y longitud como decimal, no float: la aritmética de coma flotante desplaza el marcador metros. Con CHECK de rango en el motor.' },
]

export const PROCESS = [
  { step: '01', title: 'Leí el enunciado como un contrato', detail: 'Cada criterio de aceptación se convirtió en una historia de usuario con su prueba antes de escribir código.' },
  { step: '02', title: 'Modelé el dominio primero', detail: 'Reglas, DTOs y contratos de repositorio sin framework. La persistencia y HTTP llegaron después, como detalles.' },
  { step: '03', title: 'Probé sobre PostgreSQL real', detail: 'No SQLite en memoria: el esquema usa CHECK, índices parciales e ILIKE que otro motor no reproduce.' },
  { step: '04', title: 'Dejé que las pruebas me corrigieran', detail: 'Destaparon dos bugs reales: índices únicos que incluían borrados lógicos y un contador de intentos deshecho por un rollback.' },
  { step: '05', title: 'Automaticé la verificación', detail: 'Estilo, análisis estático, 163 pruebas y compilación en cada push. Un fallo impide integrar.' },
]

/**
 * Guía de ejecución, paso a paso.
 *
 * El enunciado pide el paso a paso «como si su abuelita quisiera realizar el
 * despliegue». Está aquí, en la propia página, además de en INSTALL.md: quien
 * evalúa no debería tener que salir a buscarlo.
 */
export interface InstallStep {
  title: string
  detail: string
  commands?: string[]
  expect?: string
}

export const REQUIREMENTS = [
  { name: 'PHP 8.2+', check: 'php --version', note: 'Con las extensiones pdo_pgsql y pgsql activas en php.ini' },
  { name: 'Composer 2', check: 'composer --version', note: 'Gestor de dependencias de PHP' },
  { name: 'Node.js 20+', check: 'node --version', note: 'Para compilar y servir la interfaz' },
  { name: 'PostgreSQL 17', check: 'psql --version', note: 'La base de datos; anote la contraseña que elija al instalar' },
]

export const INSTALL_STEPS: InstallStep[] = [
  {
    title: 'Descargar el proyecto',
    detail: 'Abra una terminal, sitúese donde quiera guardarlo y clone el repositorio. Si no tiene Git, descárguelo como ZIP desde GitHub y descomprímalo.',
    commands: ['git clone https://github.com/ingealex11/prueba-tecnica-decameron.git', 'cd prueba-tecnica-decameron'],
    expect: 'Debería ver las carpetas backend, frontend, database y docs.',
  },
  {
    title: 'Crear la base de datos',
    detail: 'Con PostgreSQL instalado, cree un usuario y dos bases: una de trabajo y otra para las pruebas. Al pedir contraseña, escríbala aunque no se vea nada en pantalla.',
    commands: [
      'psql -U postgres -c "CREATE ROLE decameron WITH LOGIN PASSWORD \'decameron_2026\' CREATEDB"',
      'psql -U postgres -c "CREATE DATABASE decameron OWNER decameron"',
      'psql -U postgres -c "CREATE DATABASE decameron_testing OWNER decameron"',
    ],
    expect: 'Debería ver CREATE ROLE y dos veces CREATE DATABASE.',
  },
  {
    title: 'Poner en marcha el backend',
    detail: 'Entre en la carpeta backend, instale las dependencias, cree la configuración, genere la clave, cree las tablas con los datos de ejemplo y arranque el servidor. Deje esta terminal abierta.',
    commands: [
      'cd backend',
      'composer install',
      'cp .env.example .env',
      'php artisan key:generate',
      'php artisan migrate --seed',
      'php artisan serve',
    ],
    expect: 'Debería ver: Server running on http://127.0.0.1:8000',
  },
  {
    title: 'Poner en marcha el frontend',
    detail: 'En una segunda terminal, entre en la carpeta frontend, instale las dependencias, cree la configuración y arranque.',
    commands: ['cd frontend', 'npm install', 'cp .env.example .env', 'npm run dev'],
    expect: 'Debería ver: Local: http://localhost:5173/',
  },
  {
    title: 'Abrir y comprobar',
    detail: 'Visite localhost:5173 en Chrome o Firefox. Pulse «Entrar a la aplicación», rellene las credenciales de prueba con el botón, use el código que aparece en pantalla y entre al panel.',
    expect: 'Decameron Cartagena debe mostrar 42 / 42 y la etiqueta Completo: es el hotel del ejemplo del enunciado.',
  },
]

export const VERIFY_CHECKLIST = [
  'El panel muestra cuatro hoteles y un mapa con cuatro marcadores.',
  'En Decameron Galeón, al asignar habitaciones y elegir Junior, sólo aparecen Triple y Cuádruple.',
  'Al cambiar a Estándar, sólo aparecen Sencilla y Doble, con Doble bloqueada porque ya está configurada.',
  'Al pedir 50 habitaciones con 38 libres, el servidor responde: sólo quedan 38 disponibles.',
  'En localhost:8000/docs/api se ve la documentación interactiva con 16 operaciones.',
]

export const TROUBLESHOOTING = [
  { problem: '«could not find driver»', fix: 'Falta la extensión de PostgreSQL en PHP. En php.ini quite el punto y coma de extension=pdo_pgsql y extension=pgsql, y reinicie la terminal.' },
  { problem: '«Connection refused»', fix: 'PostgreSQL no está en marcha. En Windows, inicie el servicio postgresql-x64-17 desde Servicios; en macOS, brew services start postgresql@17.' },
  { problem: 'La página carga pero no aparece ningún hotel', fix: 'El frontend no llega al backend. Compruebe que la terminal de php artisan serve sigue abierta y que frontend/.env apunta a http://localhost:8000/api/v1.' },
  { problem: 'Quiero empezar de cero', fix: 'Desde backend: php artisan migrate:fresh --seed. Borra todo y vuelve a crear los datos de ejemplo.' },
]

export const DELIVERABLES = [
  { title: 'Código fuente', detail: 'Repositorio público en GitHub con historial de commits que explica cada decisión.', href: 'https://github.com/ingealex11/prueba-tecnica-decameron', label: 'Ver repositorio' },
  { title: 'Guía de instalación', detail: 'INSTALL.md: el paso a paso completo, con qué debería verse tras cada orden y qué hacer si algo falla.', href: 'https://github.com/ingealex11/prueba-tecnica-decameron/blob/main/INSTALL.md', label: 'Leer INSTALL.md' },
  { title: 'Documentación técnica', detail: 'README con arquitectura, patrones, principios SOLID, seguridad, persistencia y trazabilidad con cada criterio del enunciado.', href: 'https://github.com/ingealex11/prueba-tecnica-decameron/blob/main/README.md', label: 'Leer README' },
  { title: 'Diagramas UML', detail: 'Entidad-relación, componentes, clases del dominio y secuencia de una asignación, en Mermaid renderizable en GitHub.', href: 'https://github.com/ingealex11/prueba-tecnica-decameron/tree/main/docs/uml', label: 'Ver diagramas' },
  { title: 'Dump de la base de datos', detail: 'Esquema, datos y volcado completo listos para restaurar con psql. Verificado sobre una base limpia.', href: 'https://github.com/ingealex11/prueba-tecnica-decameron/tree/main/database/dump', label: 'Ver dumps' },
  { title: 'Documentación OpenAPI', detail: 'Referencia interactiva de la API, generada desde el código, con consola para probar cada endpoint.', href: '__API_DOCS__', label: 'Abrir /docs/api' },
  { title: 'Colección de Postman', detail: 'Todas las peticiones, incluidas las que deben fallar, con pruebas que comprueban el código HTTP esperado.', href: 'https://github.com/ingealex11/prueba-tecnica-decameron/blob/main/docs/api/decameron.postman_collection.json', label: 'Descargar colección' },
  { title: 'Backlog SCRUM', detail: 'Trece historias de usuario con criterios de aceptación, definition of done y trazabilidad con el enunciado.', href: 'https://github.com/ingealex11/prueba-tecnica-decameron/blob/main/docs/scrum/product-backlog.md', label: 'Ver backlog' },
]

export const QUALITY_STATS = [
  { label: 'Pruebas', value: '163', note: '113 backend · 50 frontend' },
  { label: 'Análisis estático', value: 'Nivel 6', note: 'sin errores silenciados' },
  { label: 'Endpoints', value: '16', note: 'documentados en OpenAPI 3.1' },
  { label: 'Bugs reales hallados', value: '2', note: 'por las pruebas, antes de entregar' },
]
