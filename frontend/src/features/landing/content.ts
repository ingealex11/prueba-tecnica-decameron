/**
 * Contenido de la página de presentación.
 *
 * Se mantiene separado de los componentes para que la página sea un problema de
 * maquetación y no una mezcla de texto y marcado. Revisar o traducir el
 * contenido se hace aquí, sin riesgo de romper la interfaz.
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

export interface SecurityItem {
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

export const BACKEND_STACK: TechItem[] = [
  {
    name: 'PHP',
    version: '8.2',
    role: 'Tipado estricto, propiedades de sólo lectura y enumeraciones en todo el dominio.',
  },
  {
    name: 'Laravel',
    version: '12',
    role: 'Contenedor de inversión de control, Eloquent, validación y sistema de pruebas.',
  },
  {
    name: 'PostgreSQL',
    version: '17',
    role: 'Persistencia con restricciones CHECK, claves foráneas e índices únicos parciales.',
  },
  {
    name: 'Sanctum',
    version: '4',
    role: 'Autenticación por token, activable mediante configuración.',
  },
  {
    name: 'Pest',
    version: '4',
    role: 'Pruebas unitarias y de integración con informe de cobertura.',
  },
  {
    name: 'Larastan',
    version: '3',
    role: 'Análisis estático que detecta errores de tipo antes de ejecutar.',
  },
]

export const FRONTEND_STACK: TechItem[] = [
  {
    name: 'React',
    version: '19',
    role: 'Interfaz por componentes con hooks propios por funcionalidad.',
  },
  {
    name: 'TypeScript',
    version: '5.9',
    role: 'Contrato de la API tipado de extremo a extremo.',
  },
  {
    name: 'Vite',
    version: '7',
    role: 'Servidor de desarrollo instantáneo y compilación optimizada.',
  },
  {
    name: 'TanStack Query',
    version: '5',
    role: 'Caché, estados de carga y revalidación tras cada escritura.',
  },
  {
    name: 'Tailwind CSS',
    version: '4',
    role: 'Sistema de diseño por tokens y diseño adaptable.',
  },
  {
    name: 'Zod + React Hook Form',
    version: '4 · 7',
    role: 'Validación en cliente en espejo con la del servidor.',
  },
  {
    name: 'Vitest + Testing Library',
    version: '3 · 16',
    role: 'Pruebas de componentes centradas en el comportamiento.',
  },
]

export const PATTERNS: PatternItem[] = [
  {
    name: 'Strategy',
    what: 'Cada tipo de habitación tiene su propia clase de regla, y un resolutor elige la que corresponde.',
    why: 'Incorporar un tipo nuevo se resuelve creando una clase, sin modificar ninguna existente. Ninguna regla ya probada puede romperse por accidente.',
    where: 'AccommodationRule · StandardRoomRule · JuniorRoomRule · SuiteRoomRule',
  },
  {
    name: 'Repository',
    what: 'El dominio define interfaces de persistencia; la infraestructura las implementa con Eloquent.',
    why: 'La lógica de negocio se prueba con dobles, sin base de datos, y cambiar el motor no obliga a tocar el dominio.',
    where: 'HotelRepositoryInterface → EloquentHotelRepository',
  },
  {
    name: 'Service Layer',
    what: 'Las reglas viven en servicios, no en los controladores.',
    why: 'Las mismas reglas se aplican venga la petición de HTTP, de consola o de una cola de trabajos.',
    where: 'HotelService · RoomAssignmentService · RoomCapacityValidator',
  },
  {
    name: 'Data Transfer Object',
    what: 'Objetos inmutables transportan los datos entre capas.',
    why: 'Las firmas de los métodos dicen qué reciben, en lugar de aceptar arrays cuyo contenido sólo se descubre leyendo el código.',
    where: 'HotelData · RoomAssignmentData · HotelFilterData',
  },
  {
    name: 'Dependency Injection',
    what: 'Un único proveedor ata cada interfaz con su implementación.',
    why: 'Sustituir una implementación, en producción o en una prueba, es un cambio de una línea.',
    where: 'DomainServiceProvider',
  },
  {
    name: 'Resource / Presenter',
    what: 'Clases dedicadas deciden qué expone la API.',
    why: 'El contrato público no queda atado al esquema de la tabla: renombrar una columna no rompe a los clientes.',
    where: 'HotelResource · HotelRoomResource · RoomTypeResource',
  },
]

export const SOLID: PrincipleItem[] = [
  {
    letter: 'S',
    name: 'Responsabilidad Única',
    applied:
      'RoomCapacityValidator sólo valida capacidad; AccommodationRuleResolver sólo decide acomodaciones. Cada clase tiene un motivo para cambiar.',
  },
  {
    letter: 'O',
    name: 'Abierto / Cerrado',
    applied:
      'Añadir un tipo de habitación es crear una clase de regla y registrarla. Hay una prueba que lo demuestra sin modificar código existente.',
  },
  {
    letter: 'L',
    name: 'Sustitución de Liskov',
    applied:
      'Cualquier implementación de los repositorios es intercambiable. Las pruebas unitarias lo aprovechan sustituyéndolos por dobles.',
  },
  {
    letter: 'I',
    name: 'Segregación de Interfaces',
    applied:
      'CatalogRepositoryInterface expone sólo lectura, porque el enunciado descarta administrar catálogos. La regla queda en el contrato.',
  },
  {
    letter: 'D',
    name: 'Inversión de Dependencias',
    applied:
      'Los servicios dependen de interfaces del dominio, nunca de Eloquent. Las dependencias apuntan hacia el núcleo, no hacia el framework.',
  },
]

export const SECURITY: SecurityItem[] = [
  {
    title: 'Inyección SQL',
    detail:
      'Consultas parametrizadas vía Eloquent. El ordenamiento, que sí acaba interpolado en la cláusula ORDER BY, se restringe a una lista cerrada de columnas.',
  },
  {
    title: 'Cross-site scripting',
    detail:
      'React escapa por defecto todo lo que renderiza y no se usa inserción directa de HTML en ningún punto de la aplicación.',
  },
  {
    title: 'Validación en dos niveles',
    detail:
      'El cliente valida para dar respuesta inmediata; el servidor valida porque es lo único que el usuario no controla. Ninguna regla depende sólo del navegador.',
  },
  {
    title: 'Autenticación',
    detail:
      'Sanctum con tokens sobre los endpoints de escritura, activable con una variable de entorno. Se entrega desactivada para que la demo sea evaluable sin credenciales.',
  },
  {
    title: 'Límite de peticiones',
    detail:
      'Cuota por minuto y por IP, más estricta en escritura que en lectura, frente a abuso y a clientes mal configurados.',
  },
  {
    title: 'Control de origen',
    detail:
      'CORS restringido a los orígenes declarados, en lugar de abrir la API a cualquier dominio.',
  },
  {
    title: 'Cabeceras de seguridad',
    detail:
      'nosniff, X-Frame-Options, Referrer-Policy y Permissions-Policy en todas las respuestas; HSTS cuando la conexión es cifrada.',
  },
  {
    title: 'Referencias directas a objetos',
    detail:
      'Las rutas anidadas comprueban la pertenencia: no se puede manipular la configuración de un hotel a través del identificador de otro.',
  },
  {
    title: 'Fuga de información',
    detail:
      'En producción los errores inesperados no revelan mensajes internos, rutas del servidor ni trazas de ejecución.',
  },
  {
    title: 'Gestión de secretos',
    detail:
      'Credenciales en variables de entorno, nunca en el repositorio. Sólo las variables con prefijo VITE_ llegan al navegador.',
  },
]

export const PERSISTENCE = [
  {
    title: 'Doble barrera de integridad',
    detail:
      'Cada regla se hace cumplir en la aplicación, con mensajes legibles, y en el motor, que es lo único que resiste escrituras concurrentes.',
  },
  {
    title: 'Índices únicos parciales',
    detail:
      'La unicidad de nombre y NIT aplica sólo a los hoteles activos (WHERE deleted_at IS NULL), de modo que el nombre de un hotel retirado puede reutilizarse.',
  },
  {
    title: 'Bloqueo pesimista',
    detail:
      'La asignación de habitaciones bloquea la fila del hotel dentro de la transacción, para que dos peticiones simultáneas no puedan superar juntas el máximo.',
  },
  {
    title: 'Restricciones CHECK',
    detail:
      'Las cantidades y el máximo de habitaciones se validan también en el esquema, no sólo en el código.',
  },
  {
    title: 'Catálogo como dato',
    detail:
      'La matriz de combinaciones válidas se guarda en una tabla derivada de las reglas del dominio, y el frontend la consulta en lugar de duplicarla.',
  },
  {
    title: 'Borrado lógico',
    detail:
      'Dar de baja un hotel conserva su historial y su configuración; restaurarlo lo devuelve tal como estaba.',
  },
]

export const QUALITY = [
  { label: 'Pruebas automatizadas', value: '96', note: 'unitarias y de integración' },
  { label: 'Aserciones', value: '239', note: 'sobre PostgreSQL real' },
  { label: 'Endpoints REST', value: '12', note: 'versionados en /api/v1' },
  { label: 'Integración continua', value: 'GitHub Actions', note: 'estilo, análisis estático, pruebas y compilación' },
]
