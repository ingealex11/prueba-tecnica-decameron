import {
  ArrowRight,
  BookOpenText,
  Check,
  Database,
  FlaskConical,
  KeyRound,
  Layers,
  Lock,
  MapPin,
  Minus,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

import {
  ACCOMMODATION_MATRIX,
  AI_BOUNDARIES,
  AI_PRINCIPLE,
  AI_USAGE,
  BACKEND_STACK,
  CHALLENGE,
  DELIVERABLES,
  EXTRAS,
  FRONTEND_STACK,
  HERO,
  INSTALL_STEPS,
  PATTERNS,
  PERSISTENCE,
  PROCESS,
  QUALITY_STATS,
  REQUIREMENTS,
  SECURITY,
  SOLID,
  TROUBLESHOOTING,
  VERIFY_CHECKLIST,
  type TechItem,
} from '@/features/landing/content'
import { ArchitectureDiagram, AuthFlowDiagram, ErDiagram, RequestFlowDiagram } from '@/features/landing/diagrams'
import { CommandBlock } from '@/shared/components/CommandBlock'
import { Container } from '@/shared/components/Container'
import { GithubIcon } from '@/shared/components/GithubIcon'

const REPO_URL = 'https://github.com/ingealex11/prueba-tecnica-decameron'
const API_DOCS_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace(/\/api\/v1\/?$/, '/docs/api')

/**
 * Página de presentación del proyecto.
 *
 * Escrita en primera persona: explico qué me pidieron, qué decidí y por qué,
 * con diagramas en lugar de listas, y con acceso directo a la aplicación, a la
 * documentación de la API y al repositorio.
 */
export function LandingPage() {
  const { hash } = useLocation()

  /*
   * La página se carga bajo demanda, así que cuando el navegador intenta ir
   * al ancla de la URL (#instalacion, #ia…) la sección todavía no existe. Al
   * montarse, se desplaza a la sección indicada; sin esto, un enlace
   * compartido a una sección concreta abriría siempre el principio.
   */
  useEffect(() => {
    if (!hash) return
    const target = document.getElementById(hash.slice(1))
    target?.scrollIntoView({ block: 'start' })
  }, [hash])

  return (
    <div className="pb-16">
      <Hero />
      <Container className="space-y-24 py-20 sm:space-y-28">
        <Challenge />
        <Architecture />
        <BusinessRules />
        <Auth />
        <DataModel />
        <Stack />
        <Patterns />
        <SolidPrinciples />
        <Security />
        <Persistence />
        <Process />
        <AiCollaboration />
        <Installation />
        <Deliverables />
        <FinalCta />
      </Container>
    </div>
  )
}

// ---------------------------------------------------------------------------

function Hero() {
  return (
    <section className="relative overflow-hidden bg-sidebar text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-40 -top-40 size-[36rem] rounded-full bg-brand-600/40 blur-3xl" />
        <div className="absolute -bottom-48 right-[-10rem] size-[34rem] rounded-full bg-teal-500/20 blur-3xl" />
        <svg className="absolute inset-0 h-full w-full opacity-[0.05]">
          <defs>
            <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      <Container className="relative grid gap-12 py-20 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:py-28">
        <div className="max-w-2xl animate-fade-up">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider ring-1 ring-white/15">
            <Sparkles className="size-3.5 text-teal-400" aria-hidden="true" />
            {HERO.eyebrow}
          </p>
          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]">{HERO.title}</h1>
          <p className="mt-6 text-lg leading-relaxed text-white/70">{HERO.lead}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to="/login" className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-6 text-sm font-semibold text-sidebar shadow-lg shadow-black/20 transition-transform hover:scale-[1.02]">
              Entrar a la aplicación
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a href={API_DOCS_URL} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-6 text-sm font-semibold text-white ring-1 ring-inset ring-white/25 transition-colors hover:bg-white/10">
              <BookOpenText className="size-4" aria-hidden="true" />
              Documentación de la API
            </a>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-6 text-sm font-semibold text-white ring-1 ring-inset ring-white/25 transition-colors hover:bg-white/10">
              <GithubIcon className="size-4" />
              Código fuente
            </a>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3 animate-fade-up [animation-delay:120ms]">
          {QUALITY_STATS.map((s) => (
            <div key={s.label} className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10 backdrop-blur">
              <dt className="text-[0.7rem] font-semibold uppercase tracking-wider text-white/50">{s.label}</dt>
              <dd className="mt-2 text-3xl font-bold tracking-tight">{s.value}</dd>
              <dd className="mt-1 text-xs text-white/55">{s.note}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  )
}

function Challenge() {
  return (
    <Section id="reto" eyebrow="El reto" title="Qué se pidió y qué añadí" lead="El enunciado define un CRUD de hoteles y habitaciones con tres reglas de negocio. Cubrí esos requisitos y añadí algunas piezas que, en mi experiencia, un sistema así necesita al pasar de una prueba a la operación diaria.">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink"><Check className="size-4 text-success" aria-hidden="true" /> Lo que exige el enunciado</h3>
          <ul className="grid gap-3 sm:grid-cols-2">
            {CHALLENGE.map((item) => (
              <li key={item.title} className="card p-4">
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="mt-1 text-sm text-ink-2">{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink"><Sparkles className="size-4 text-accent" aria-hidden="true" /> Lo que añadí por iniciativa propia</h3>
          <ul className="grid gap-3 sm:grid-cols-2">
            {EXTRAS.map((item) => (
              <li key={item.title} className="rounded-card bg-accent/[0.06] p-4 ring-1 ring-accent/20">
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="mt-1 text-sm text-ink-2">{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}

function Architecture() {
  return (
    <Section id="arquitectura" eyebrow="Arquitectura" title="Dos aplicaciones desacopladas y un dominio independiente del framework" lead="Frontend y backend se despliegan por separado y sólo comparten un contrato HTTP/JSON. Dentro del backend, las dependencias apuntan hacia el dominio, de modo que las mismas reglas podrían exponerse por consola o por otro protocolo sin cambiar la lógica.">
      <Figure caption="Cada capa responde a una pregunta distinta. El FormRequest pregunta si la petición está bien formada; el Service, si tiene sentido en el negocio. Mezclarlas habría sido más corto y habría dejado las reglas fuera del alcance de cualquier proceso que no fuera HTTP.">
        <ArchitectureDiagram />
      </Figure>
    </Section>
  )
}

function BusinessRules() {
  const { accommodations, types } = ACCOMMODATION_MATRIX

  return (
    <Section id="reglas" eyebrow="Reglas de negocio" title="Tres reglas, una transacción y tres puntos de rechazo" lead="La regla central del enunciado —qué acomodación admite cada tipo— la modelé con el patrón Strategy: una clase por tipo. La tabla de catálogo se deriva de esas clases, y el frontend la consulta para ofrecer sólo opciones válidas. Una sola fuente de verdad.">
      <div className="space-y-8">
        <div className="card max-w-2xl overflow-hidden">
          <table className="w-full text-sm">
            <caption className="sr-only">Acomodaciones permitidas para cada tipo de habitación</caption>
            <thead>
              <tr className="border-b border-line bg-surface-2/60">
                <th scope="col" className="eyebrow px-4 py-3 text-left">Tipo</th>
                {accommodations.map((a) => (
                  <th key={a} scope="col" className="eyebrow px-2 py-3 text-center">{a}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {types.map((t) => (
                <tr key={t.name}>
                  <th scope="row" className="px-4 py-3 text-left font-medium text-ink">{t.name}</th>
                  {t.allowed.map((ok, i) => (
                    <td key={accommodations[i]} className="px-2 py-3 text-center">
                      <span className={ok ? 'inline-grid size-7 place-items-center rounded-full bg-success-soft text-success' : 'inline-grid size-7 place-items-center rounded-full bg-surface-2 text-ink-3'}>
                        {ok ? <Check className="size-4" aria-hidden="true" /> : <Minus className="size-4" aria-hidden="true" />}
                        <span className="sr-only">{ok ? 'Permitida' : 'No permitida'}</span>
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-line px-4 py-3 text-xs text-ink-3">Probé las doce combinaciones: las siete válidas y las cinco que deben rechazarse.</p>
        </div>

        <Figure caption="La validación de capacidad es un leer-modificar-escribir. Sin el bloqueo, dos peticiones simultáneas podrían superar juntas el máximo entre la lectura y la escritura.">
          <RequestFlowDiagram />
        </Figure>
      </div>
    </Section>
  )
}

function Auth() {
  return (
    <Section id="autenticacion" eyebrow="Autenticación" title="Inicio de sesión en dos pasos" lead="El enunciado no pedía inicio de sesión. Lo añadí porque el sistema maneja datos tributarios, e implementé el segundo factor de forma completa: el código se genera, se guarda cifrado, caduca y se verifica en el servidor. En esta demostración se muestra en pantalla en lugar de enviarse por SMS; la verificación es la misma.">
      <Figure caption="Comparo la contraseña incluso cuando el correo no existe, contra un hash ficticio: si no lo hiciera, la respuesta sería más rápida para correos inexistentes y esa diferencia delataría qué cuentas hay.">
        <AuthFlowDiagram />
      </Figure>
    </Section>
  )
}

function DataModel() {
  return (
    <Section id="datos" eyebrow="Modelo de datos" title="Las reglas también viven en el motor" lead="La validación de la aplicación produce buenos mensajes; sólo la base de datos garantiza la invariante frente a escrituras concurrentes o accesos externos. Por eso cada regla está en los dos sitios.">
      <Figure caption="Una prueba automatizada destapó que los índices únicos corrientes incluían los hoteles con borrado lógico: el nombre de un hotel retirado quedaba bloqueado para siempre. Los cambié por índices parciales.">
        <ErDiagram />
      </Figure>
    </Section>
  )
}

function Stack() {
  return (
    <Section id="stack" eyebrow="Tecnología" title="Qué usé y para qué" lead="Elegí cada pieza por una necesidad concreta del proyecto; aquí indico cuál.">
      <div className="grid gap-6 lg:grid-cols-2">
        <TechColumn title="Backend" items={BACKEND_STACK} />
        <TechColumn title="Frontend" items={FRONTEND_STACK} />
      </div>
    </Section>
  )
}

function TechColumn({ title, items }: { title: string; items: TechItem[] }) {
  return (
    <div className="card p-6">
      <h3 className="eyebrow mb-5">{title}</h3>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.name} className="flex gap-4">
            <span className="mt-1 h-fit shrink-0 rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[0.7rem] text-ink-2 ring-1 ring-line">{item.version}</span>
            <div>
              <p className="font-semibold text-ink">{item.name}</p>
              <p className="text-sm text-ink-2">{item.role}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Patterns() {
  return (
    <Section id="patrones" eyebrow="Patrones de diseño" title="Patrones aplicados y el problema que resuelve cada uno" lead="Procuré aplicar sólo los patrones que respondían a un problema concreto del sistema. Para cada uno indico qué hace, por qué lo elegí y dónde está en el código.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PATTERNS.map((p) => (
          <article key={p.name} className="card flex flex-col p-5">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-accent/10 text-accent" aria-hidden="true"><Layers className="size-4" /></span>
              <h3 className="font-semibold text-ink">{p.name}</h3>
            </div>
            <p className="mt-3 text-sm text-ink-2">{p.what}</p>
            <p className="mt-3 flex-1 text-sm text-ink-2"><span className="font-medium text-ink">Por qué: </span>{p.why}</p>
            <p className="mt-4 border-t border-line pt-3 font-mono text-[0.7rem] leading-relaxed text-ink-3">{p.where}</p>
          </article>
        ))}
      </div>
    </Section>
  )
}

function SolidPrinciples() {
  return (
    <Section id="solid" eyebrow="Principios SOLID" title="Dónde se aplica cada principio" lead="Más que enumerarlos, indico el punto del código donde se aplica cada uno y la razón.">
      <ul className="grid gap-3 md:grid-cols-2">
        {SOLID.map((p) => (
          <li key={p.letter} className="card flex gap-4 p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sidebar text-lg font-bold text-white" aria-hidden="true">{p.letter}</span>
            <div>
              <h3 className="font-semibold text-ink">{p.name}</h3>
              <p className="mt-1 text-sm text-ink-2">{p.applied}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}

function Security() {
  return (
    <Section id="seguridad" eyebrow="Seguridad" title="Defensa en profundidad" lead="Ninguna medida basta por sí sola; el objetivo es que un fallo en una capa no comprometa el sistema entero.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECURITY.map((item, i) => (
          <div key={item.title} className="card p-4">
            <h3 className="flex items-center gap-2 font-semibold text-ink">
              {i === 0 ? <KeyRound className="size-4 text-accent" aria-hidden="true" /> : <Lock className="size-4 text-success" aria-hidden="true" />}
              {item.title}
            </h3>
            <p className="mt-1.5 text-sm text-ink-2">{item.detail}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

function Persistence() {
  return (
    <Section id="persistencia" eyebrow="Persistencia" title="Decisiones sobre la base de datos" lead="Las pruebas corren sobre PostgreSQL y no sobre SQLite en memoria: el esquema usa CHECK, índices parciales y el operador ILIKE, que otro motor no reproduce, así que una suite en verde sobre otra base diría poco del comportamiento real.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PERSISTENCE.map((item) => (
          <div key={item.title} className="card p-4">
            <h3 className="flex items-center gap-2 font-semibold text-ink"><Database className="size-4 text-accent" aria-hidden="true" />{item.title}</h3>
            <p className="mt-1.5 text-sm text-ink-2">{item.detail}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

function Process() {
  return (
    <Section id="calidad" eyebrow="Cómo lo construí" title="Cómo organicé el trabajo" lead="Seguí SCRUM adaptado a dos sprints: trece historias con criterios de aceptación verificables, definition of done, y trazabilidad de cada criterio del enunciado con la historia y la prueba que lo cubre.">
      <ol className="relative space-y-6 border-l border-line pl-8">
        {PROCESS.map((p) => (
          <li key={p.step} className="relative">
            <span className="absolute -left-[2.45rem] grid size-8 place-items-center rounded-full bg-accent font-mono text-[0.7rem] font-bold text-accent-ink ring-4 ring-canvas" aria-hidden="true">{p.step}</span>
            <h3 className="font-semibold text-ink">{p.title}</h3>
            <p className="mt-1 text-sm text-ink-2">{p.detail}</p>
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          { icon: FlaskConical, title: 'Pruebas unitarias', detail: 'Las doce combinaciones de tipo y acomodación, los casos frontera de capacidad, y una prueba que añade un tipo nuevo sin modificar código existente.' },
          { icon: Workflow, title: 'Pruebas de integración', detail: 'Cada endpoint con sus casos de éxito y rechazo, el flujo de autenticación completo, y la protección contra manipular la configuración de un hotel a través de otro.' },
          { icon: ShieldCheck, title: 'Integración continua', detail: 'Estilo, Larastan nivel 6, 163 pruebas y compilación, en PHP 8.2 y 8.3, en cada push. Sin ignoreErrors ni línea base: silenciar es aplazar.' },
        ].map(({ icon: Icon, title, detail }) => (
          <div key={title} className="card p-5">
            <span className="grid size-9 place-items-center rounded-lg bg-accent/10 text-accent" aria-hidden="true"><Icon className="size-4.5" /></span>
            <h3 className="mt-3 font-semibold text-ink">{title}</h3>
            <p className="mt-1.5 text-sm text-ink-2">{detail}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

function AiCollaboration() {
  return (
    <Section
      id="ia"
      eyebrow="Inteligencia artificial"
      title="Cómo trabajé con la IA"
      lead={AI_PRINCIPLE}
    >
      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">En qué se apoyó el trabajo en la IA y qué quedó bajo mi criterio</caption>
          <thead className="border-b border-line bg-surface-2/60">
            <tr>
              <th scope="col" className="eyebrow px-5 py-3 w-44">Área</th>
              <th scope="col" className="eyebrow px-5 py-3">
                <span className="inline-flex items-center gap-1.5"><Sparkles className="size-3.5 text-accent" aria-hidden="true" /> Dónde ayudó la IA</span>
              </th>
              <th scope="col" className="eyebrow px-5 py-3">
                <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-success" aria-hidden="true" /> Qué hice yo</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {AI_USAGE.map((row) => (
              <tr key={row.area} className="align-top">
                <th scope="row" className="px-5 py-4 font-semibold text-ink">{row.area}</th>
                <td className="px-5 py-4 text-ink-2">{row.ai}</td>
                <td className="px-5 py-4 text-ink-2">{row.me}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-card bg-accent/[0.06] p-5 ring-1 ring-accent/20">
        <h3 className="font-semibold text-ink">Lo que garantiza que el resultado es mío</h3>
        <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {AI_BOUNDARIES.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-ink-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}

function Installation() {
  return (
    <Section
      id="instalacion"
      eyebrow="Cómo ejecutarlo"
      title="Guía paso a paso"
      lead="El enunciado pide la guía «como si su abuelita quisiera realizar el despliegue». Son cinco pasos, con cada orden lista para copiar y, tras cada uno, qué debería verse en pantalla. La versión extendida, con la instalación de cada requisito, está en INSTALL.md."
    >
      <div className="space-y-10">
        <div>
          <h3 className="mb-4 text-sm font-semibold text-ink">Antes de empezar, cuatro programas</h3>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {REQUIREMENTS.map((r) => (
              <li key={r.name} className="card p-4">
                <p className="font-semibold text-ink">{r.name}</p>
                <p className="mt-1 text-sm text-ink-2">{r.note}</p>
                <p className="mt-3 rounded-md bg-surface-2 px-2 py-1 font-mono text-xs text-ink-2">{r.check}</p>
              </li>
            ))}
          </ul>
        </div>

        <ol className="space-y-6">
          {INSTALL_STEPS.map((step, i) => (
            <li key={step.title} className="card grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent font-mono text-sm font-bold text-accent-ink" aria-hidden="true">{i + 1}</span>
                  <h3 className="text-lg font-semibold text-ink">{step.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-2">{step.detail}</p>
                {step.expect && (
                  <p className="mt-3 flex items-start gap-2 rounded-lg bg-success-soft px-3 py-2 text-sm text-ink">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                    <span>{step.expect}</span>
                  </p>
                )}
              </div>
              {step.commands ? (
                <CommandBlock commands={step.commands} />
              ) : (
                <div className="flex items-center justify-center rounded-xl bg-surface-2 p-6 text-center text-sm text-ink-2">
                  Sin órdenes: este paso se hace en el navegador. Credenciales de prueba: <code className="mx-1 rounded bg-surface px-1.5 py-0.5 font-mono text-xs text-ink">gerente@decameron.test</code> / <code className="mx-1 rounded bg-surface px-1.5 py-0.5 font-mono text-xs text-ink">decameron2026</code>
                </div>
              )}
            </li>
          ))}
        </ol>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <h3 className="font-semibold text-ink">Lista de comprobación</h3>
            <p className="mt-1 text-sm text-ink-2">Si estas cinco cosas se cumplen, la instalación está bien y las reglas del negocio funcionan.</p>
            <ul className="mt-4 space-y-2.5">
              {VERIFY_CHECKLIST.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-ink-2">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded border border-line-strong" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-ink">Si algo sale mal</h3>
            <p className="mt-1 text-sm text-ink-2">Los cuatro tropiezos más habituales y cómo salir de ellos.</p>
            <dl className="mt-4 space-y-3">
              {TROUBLESHOOTING.map((t) => (
                <div key={t.problem}>
                  <dt className="text-sm font-semibold text-ink">{t.problem}</dt>
                  <dd className="mt-0.5 text-sm text-ink-2">{t.fix}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </Section>
  )
}

function Deliverables() {
  return (
    <Section
      id="entregables"
      eyebrow="Entregables"
      title="Entregables del enunciado"
      lead="Código en repositorio público, documentación con diagramas UML, dump de la base de datos listo para instalar y guía de despliegue. Cada uno enlazado desde aquí."
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DELIVERABLES.map((d) => {
          const href = d.href === '__API_DOCS__' ? API_DOCS_URL : d.href
          return (
            <li key={d.title} className="card flex flex-col p-5">
              <h3 className="font-semibold text-ink">{d.title}</h3>
              <p className="mt-2 flex-1 text-sm text-ink-2">{d.detail}</p>
              <a href={href} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline">
                {d.label} <ArrowRight className="size-3.5" aria-hidden="true" />
              </a>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-sidebar px-6 py-14 text-center text-white sm:px-12">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-20 -top-20 size-72 rounded-full bg-brand-600/40 blur-3xl" />
        <div className="absolute -bottom-24 -right-20 size-80 rounded-full bg-teal-500/20 blur-3xl" />
      </div>
      <div className="relative">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Véalo funcionando</h2>
        <p className="mx-auto mt-3 max-w-xl text-white/70">
          Incluye el hotel del ejemplo del enunciado con sus 42 habitaciones ya configuradas, tres sedes más en el mapa y credenciales de prueba visibles en el inicio de sesión.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/login" className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-sidebar shadow-lg transition-transform hover:scale-[1.02]">
            Entrar a la aplicación <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link to="/app/mapa" className="inline-flex h-12 items-center gap-2 rounded-xl px-6 text-sm font-semibold text-white ring-1 ring-inset ring-white/25 hover:bg-white/10">
            <MapPin className="size-4" aria-hidden="true" /> Mapa de sedes
          </Link>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------

function Section({ id, eyebrow, title, lead, children }: { id: string; eyebrow: string; title: string; lead: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <header className="mb-8 max-w-3xl">
        <p className="eyebrow text-accent">{eyebrow}</p>
        <h2 id={`${id}-title`} className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-[2.1rem] sm:leading-tight">{title}</h2>
        <p className="mt-4 text-[1.05rem] leading-relaxed text-ink-2">{lead}</p>
      </header>
      {children}
    </section>
  )
}

function Figure({ children, caption }: { children: ReactNode; caption: string }) {
  return (
    <figure className="card overflow-hidden">
      <div className="overflow-x-auto p-4 sm:p-6">
        <div className="min-w-[640px]">{children}</div>
      </div>
      <figcaption className="border-t border-line bg-surface-2/60 px-5 py-3 text-sm text-ink-2">{caption}</figcaption>
    </figure>
  )
}
