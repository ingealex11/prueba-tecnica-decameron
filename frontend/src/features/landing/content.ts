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
  title: 'Construí un sistema que hace imposible configurar mal un hotel.',
  lead:
    'Me pidieron un CRUD de hoteles y habitaciones con tres reglas de negocio. Entregué una plataforma completa: API REST documentada, panel con autenticación en dos pasos, mapa de sedes, y 163 pruebas que demuestran que cada regla se cumple.',
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
  { title: 'Autenticación en dos pasos', detail: 'Saber la contraseña no basta. El código de verificación se guarda cifrado, caduca a los cinco minutos, se consume al usarse y se invalida tras cinco fallos.' },
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

export const QUALITY_STATS = [
  { label: 'Pruebas', value: '163', note: '113 backend · 50 frontend' },
  { label: 'Análisis estático', value: 'Nivel 6', note: 'sin errores silenciados' },
  { label: 'Endpoints', value: '16', note: 'documentados en OpenAPI 3.1' },
  { label: 'Bugs reales hallados', value: '2', note: 'por las pruebas, antes de entregar' },
]
