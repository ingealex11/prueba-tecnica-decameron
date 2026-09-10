/**
 * Diagramas de la página de presentación, dibujados en SVG.
 *
 * Son SVG en línea y no imágenes por tres razones: se ven nítidos en cualquier
 * densidad de pantalla, adoptan el tema claro u oscuro a través de
 * `currentColor` y las variables de CSS, y cada caja lleva su texto real, que
 * los lectores de pantalla pueden leer.
 */

const box = 'fill-surface stroke-line-strong'
const boxAccent = 'fill-accent/10 stroke-accent'
const boxDark = 'fill-sidebar stroke-sidebar-line'
const label = 'fill-ink text-[12px] font-medium'
const labelSm = 'fill-ink-2 text-[10.5px]'
const labelOnDark = 'fill-white text-[12px] font-medium'
const labelOnDarkSm = 'fill-white/60 text-[10.5px]'
const arrow = 'stroke-ink-3'

function Defs() {
  return (
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0L10 5L0 10z" className="fill-ink-3" />
      </marker>
      <marker id="arrow-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0L10 5L0 10z" className="fill-accent" />
      </marker>
    </defs>
  )
}

function Box({ x, y, w, h, title, sub, variant = 'default', r = 10 }: { x: number; y: number; w: number; h: number; title: string; sub?: string; variant?: 'default' | 'accent' | 'dark'; r?: number }) {
  const cls = variant === 'accent' ? boxAccent : variant === 'dark' ? boxDark : box
  const t = variant === 'dark' ? labelOnDark : label
  const s = variant === 'dark' ? labelOnDarkSm : labelSm
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={r} className={cls} strokeWidth={1.25} />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 5 : h / 2 + 4)} textAnchor="middle" className={t}>{title}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 11} textAnchor="middle" className={s}>{sub}</text>}
    </g>
  )
}

/**
 * Arquitectura: dos aplicaciones desacopladas y las capas del backend, con las
 * dependencias apuntando hacia el dominio.
 */
export function ArchitectureDiagram() {
  return (
    <svg viewBox="0 0 860 380" role="img" aria-labelledby="arch-title" className="h-auto w-full">
      <title id="arch-title">Arquitectura: frontend React, API Laravel en capas y PostgreSQL</title>
      <Defs />

      {/* Frontend */}
      <rect x={20} y={40} width={200} height={300} rx={16} className="fill-surface-2 stroke-line" strokeWidth={1.25} />
      <text x={120} y={66} textAnchor="middle" className="fill-ink-3 text-[10px] font-semibold uppercase tracking-widest">Frontend · Vercel</text>
      <Box x={40} y={84} w={160} h={44} title="React 19 + TypeScript" sub="Vite · Tailwind" variant="accent" />
      <Box x={40} y={142} w={160} h={44} title="TanStack Query" sub="caché · revalidación" />
      <Box x={40} y={200} w={160} h={44} title="Hook Form + Zod" sub="validación en cliente" />
      <Box x={40} y={258} w={160} h={44} title="Leaflet" sub="mapa de sedes" />

      {/* HTTP arrow */}
      <line x1={222} y1={190} x2={290} y2={190} className="stroke-accent" strokeWidth={2} markerEnd="url(#arrow-accent)" />
      <text x={256} y={180} textAnchor="middle" className="fill-accent text-[10px] font-semibold">REST · JSON</text>

      {/* Backend */}
      <rect x={292} y={40} width={380} height={300} rx={16} className="fill-surface-2 stroke-line" strokeWidth={1.25} />
      <text x={482} y={66} textAnchor="middle" className="fill-ink-3 text-[10px] font-semibold uppercase tracking-widest">API Laravel 12 · Render</text>

      <Box x={312} y={84} w={160} h={40} title="Controller" sub="traduce HTTP" />
      <Box x={492} y={84} w={160} h={40} title="FormRequest" sub="¿bien formada?" />
      <line x1={392} y1={126} x2={392} y2={146} className={arrow} strokeWidth={1.5} markerEnd="url(#arrow)" />
      <line x1={572} y1={126} x2={572} y2={146} className={arrow} strokeWidth={1.5} markerEnd="url(#arrow)" />

      <Box x={312} y={148} w={160} h={40} title="DTO" sub="inmutable" />
      <Box x={492} y={148} w={160} h={40} title="Service" sub="¿tiene sentido?" variant="accent" />
      <line x1={474} y1={168} x2={490} y2={168} className={arrow} strokeWidth={1.5} markerEnd="url(#arrow)" />

      <line x1={572} y1={190} x2={572} y2={210} className={arrow} strokeWidth={1.5} markerEnd="url(#arrow)" />
      <Box x={492} y={212} w={160} h={40} title="Repository" sub="interfaz del dominio" variant="accent" />
      <line x1={572} y1={254} x2={572} y2={274} className={arrow} strokeWidth={1.5} strokeDasharray="4 3" markerEnd="url(#arrow)" />
      <text x={590} y={268} className="fill-ink-3 text-[9.5px]">inyección</text>
      <Box x={492} y={276} w={160} h={40} title="EloquentRepository" sub="único que conoce SQL" />

      <rect x={312} y={212} width={160} height={104} rx={10} className="fill-accent/5 stroke-accent/40" strokeWidth={1} strokeDasharray="4 3" />
      <text x={392} y={238} textAnchor="middle" className="fill-accent text-[11px] font-semibold">Dominio</text>
      <text x={392} y={256} textAnchor="middle" className={labelSm}>Rules · Services</text>
      <text x={392} y={272} textAnchor="middle" className={labelSm}>Data · Exceptions</text>
      <text x={392} y={296} textAnchor="middle" className="fill-ink-3 text-[9.5px] italic">no importa HTTP ni Eloquent</text>

      {/* DB */}
      <line x1={672} y1={296} x2={740} y2={296} className={arrow} strokeWidth={1.5} markerEnd="url(#arrow)" />
      <g>
        <ellipse cx={790} cy={262} rx={46} ry={12} className={boxDark} strokeWidth={1.25} />
        <path d="M744 262v68c0 6.6 20.6 12 46 12s46-5.4 46-12v-68" className={boxDark} strokeWidth={1.25} />
        <ellipse cx={790} cy={330} rx={46} ry={12} className="fill-none stroke-sidebar-line" strokeWidth={1.25} />
        <text x={790} y={300} textAnchor="middle" className={labelOnDark}>PostgreSQL 17</text>
        <text x={790} y={314} textAnchor="middle" className={labelOnDarkSm}>Neon</text>
      </g>
      <text x={790} y={238} textAnchor="middle" className="fill-ink-3 text-[10px] font-semibold uppercase tracking-widest">Datos</text>
    </svg>
  )
}

/**
 * Flujo de una asignación de habitaciones, con los tres puntos donde puede
 * rechazarse antes de escribir nada.
 */
export function RequestFlowDiagram() {
  const steps = [
    { title: 'POST /hotels/7/rooms', sub: 'Junior · Triple · 12' },
    { title: 'FormRequest', sub: 'campos y tipos' },
    { title: 'SELECT … FOR UPDATE', sub: 'bloquea el hotel' },
    { title: 'Regla 1', sub: '¿acomodación válida?' },
    { title: 'Regla 2', sub: '¿combinación repetida?' },
    { title: 'Regla 3', sub: '¿cabe en el máximo?' },
    { title: 'INSERT + COMMIT', sub: '201 Created' },
  ]
  const w = 112, gap = 12, x0 = 16, y = 40, h = 52

  return (
    <svg viewBox="0 0 900 200" role="img" aria-labelledby="flow-title" className="h-auto w-full">
      <title id="flow-title">Flujo de una asignación de habitaciones con sus tres puntos de rechazo</title>
      <Defs />
      {steps.map((s, i) => {
        const x = x0 + i * (w + gap)
        const isRule = s.title.startsWith('Regla')
        const isEnd = i === steps.length - 1
        return (
          <g key={s.title}>
            <Box x={x} y={y} w={w} h={h} title={s.title} sub={s.sub} variant={isEnd ? 'dark' : isRule ? 'accent' : 'default'} r={8} />
            {i < steps.length - 1 && (
              <line x1={x + w + 1} y1={y + h / 2} x2={x + w + gap - 1} y2={y + h / 2} className={arrow} strokeWidth={1.5} markerEnd="url(#arrow)" />
            )}
            {isRule && (
              <g>
                <line x1={x + w / 2} y1={y + h + 2} x2={x + w / 2} y2={y + h + 30} className="stroke-danger" strokeWidth={1.5} strokeDasharray="3 3" markerEnd="url(#arrow)" />
                <rect x={x + 6} y={y + h + 32} width={w - 12} height={40} rx={8} className="fill-danger-soft stroke-danger/40" strokeWidth={1} />
                <text x={x + w / 2} y={y + h + 49} textAnchor="middle" className="fill-danger text-[11px] font-semibold">
                  {i === 3 ? '422' : i === 4 ? '409' : '422'}
                </text>
                <text x={x + w / 2} y={y + h + 63} textAnchor="middle" className="fill-danger text-[9.5px]">
                  {i === 3 ? 'INVALID_ACCOMMODATION' : i === 4 ? 'DUPLICATE_CONFIG' : 'CAPACITY_EXCEEDED'}
                </text>
              </g>
            )}
          </g>
        )
      })}
      <text x={450} y={180} textAnchor="middle" className="fill-ink-3 text-[10.5px] italic">
        Todo ocurre dentro de una transacción: si cualquier regla falla, no se escribe nada y el bloqueo se libera.
      </text>
    </svg>
  )
}

/** Entidad del diagrama de datos: cabecera con el nombre y sus campos. */
function Entity({ x, y, name, fields, accent }: { x: number; y: number; name: string; fields: string[]; accent?: boolean }) {
  const h = 26 + fields.length * 17 + 8
  return (
    <g>
      <rect x={x} y={y} width={176} height={h} rx={10} className={accent ? boxAccent : box} strokeWidth={1.25} />
      <rect x={x} y={y} width={176} height={26} rx={10} className={accent ? 'fill-accent' : 'fill-sidebar'} />
      <rect x={x} y={y + 14} width={176} height={12} className={accent ? 'fill-accent' : 'fill-sidebar'} />
      <text x={x + 88} y={y + 17} textAnchor="middle" className="fill-white text-[11.5px] font-semibold">{name}</text>
      {fields.map((f, i) => (
        <text key={f} x={x + 10} y={y + 43 + i * 17} className={`text-[10.5px] ${f.includes('PK') || f.includes('UNIQUE') ? 'fill-ink font-medium' : 'fill-ink-2'}`}>{f}</text>
      ))}
    </g>
  )
}

/** Modelo de datos: entidades, relaciones y restricciones del motor. */
export function ErDiagram() {
  return (
    <svg viewBox="0 0 860 330" role="img" aria-labelledby="er-title" className="h-auto w-full">
      <title id="er-title">Modelo de datos con sus restricciones</title>
      <Defs />
      <Entity x={20} y={30} name="cities" fields={['id  PK', 'name  UNIQUE', 'dane_code  UNIQUE']} />
      <Entity x={240} y={30} name="hotels" fields={['id  PK', 'name  UNIQUE*', 'nit  UNIQUE*', 'city_id  FK', 'max_rooms  CHECK > 0', 'latitude · longitude', 'deleted_at']} accent />
      <Entity x={460} y={30} name="hotel_rooms" fields={['id  PK', 'hotel_id  FK', 'room_type_id  FK', 'accommodation_id  FK', 'quantity  CHECK > 0', 'UNIQUE(hotel, type, acc)']} accent />
      <Entity x={680} y={30} name="room_types" fields={['id  PK', 'slug  UNIQUE', 'name']} />
      <Entity x={680} y={150} name="accommodations" fields={['id  PK', 'slug  UNIQUE', 'capacity']} />
      <Entity x={460} y={200} name="room_type_accommodation" fields={['room_type_id  PK,FK', 'accommodation_id  PK,FK']} />

      {/* relations */}
      <line x1={196} y1={70} x2={238} y2={70} className={arrow} strokeWidth={1.5} markerEnd="url(#arrow)" />
      <line x1={416} y1={90} x2={458} y2={90} className={arrow} strokeWidth={1.5} markerEnd="url(#arrow)" />
      <line x1={636} y1={70} x2={678} y2={70} className={arrow} strokeWidth={1.5} markerEnd="url(#arrow)" />
      <line x1={636} y1={110} x2={678} y2={190} className={arrow} strokeWidth={1.5} markerEnd="url(#arrow)" />
      <line x1={636} y1={222} x2={678} y2={100} className={arrow} strokeWidth={1.5} strokeDasharray="4 3" markerEnd="url(#arrow)" />
      <line x1={636} y1={240} x2={678} y2={210} className={arrow} strokeWidth={1.5} strokeDasharray="4 3" markerEnd="url(#arrow)" />

      <text x={20} y={300} className="fill-ink-3 text-[10.5px]">* Índice único parcial: WHERE deleted_at IS NULL. El nombre de un hotel dado de baja queda libre para reutilizarse.</text>
      <text x={20} y={316} className="fill-ink-3 text-[10.5px]">La matriz room_type_accommodation la genera el seeder a partir de las clases Strategy: una sola fuente de verdad.</text>
    </svg>
  )
}

/** Autenticación en dos pasos. */
export function AuthFlowDiagram() {
  return (
    <svg viewBox="0 0 860 220" role="img" aria-labelledby="auth-title" className="h-auto w-full">
      <title id="auth-title">Flujo de autenticación en dos pasos</title>
      <Defs />
      <Box x={16} y={30} w={150} h={56} title="POST /auth/login" sub="correo + contraseña" />
      <line x1={168} y1={58} x2={214} y2={58} className={arrow} strokeWidth={1.5} markerEnd="url(#arrow)" />
      <Box x={216} y={30} w={170} h={56} title="Hash check" sub="también si no existe el correo" variant="accent" />
      <line x1={388} y1={58} x2={434} y2={58} className={arrow} strokeWidth={1.5} markerEnd="url(#arrow)" />
      <Box x={436} y={30} w={170} h={56} title="Desafío emitido" sub="código cifrado · caduca 5 min" variant="accent" />
      <line x1={608} y1={58} x2={654} y2={58} className={arrow} strokeWidth={1.5} markerEnd="url(#arrow)" />
      <Box x={656} y={30} w={188} h={56} title="200 · challenge_id" sub="sin token todavía" variant="dark" />

      <line x1={750} y1={88} x2={750} y2={120} className={arrow} strokeWidth={1.5} markerEnd="url(#arrow)" />
      <text x={766} y={108} className="fill-ink-3 text-[10px]">la persona escribe el código</text>

      <Box x={656} y={124} w={188} h={56} title="POST /auth/verify" sub="challenge_id + 6 dígitos" />
      <line x1={654} y1={152} x2={608} y2={152} className={arrow} strokeWidth={1.5} markerEnd="url(#arrow)" />
      <Box x={436} y={124} w={170} h={56} title="UPDATE … WHERE consumed_at IS NULL" sub="atómico: sólo uno gana" variant="accent" />
      <line x1={434} y1={152} x2={388} y2={152} className={arrow} strokeWidth={1.5} markerEnd="url(#arrow)" />
      <Box x={216} y={124} w={170} h={56} title="Token Sanctum" sub="por dispositivo" variant="dark" />
      <line x1={214} y1={152} x2={168} y2={152} className={arrow} strokeWidth={1.5} markerEnd="url(#arrow)" />
      <Box x={16} y={124} w={150} h={56} title="Sesión abierta" sub="Authorization: Bearer" />

      <text x={430} y={208} textAnchor="middle" className="fill-ink-3 text-[10.5px] italic">Cinco intentos y el desafío se invalida. Reutilizar un código consumido responde 401.</text>
    </svg>
  )
}
