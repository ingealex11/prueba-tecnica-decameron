import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import {
  ACCOMMODATION_MATRIX,
  BACKEND_STACK,
  FRONTEND_STACK,
  PATTERNS,
  PERSISTENCE,
  QUALITY,
  SECURITY,
  SOLID,
} from '@/features/landing/content'
import { Container } from '@/shared/components/Container'

/**
 * Página de presentación del proyecto.
 *
 * Su propósito es que quien evalúe la prueba entienda las decisiones técnicas
 * sin tener que leer todo el código, y llegue a la aplicación funcional con un
 * clic. Explica el problema, la arquitectura, los patrones aplicados, cómo se
 * resolvieron la seguridad y la persistencia, y cómo se verifica todo ello.
 */
export function LandingPage() {
  return (
    <div className="pb-12">
      {/* La cabecera ocupa el ancho completo de la ventana; el resto del
          contenido se centra dentro del contenedor de la aplicación. */}
      <Hero />

      <Container className="space-y-16 py-16 sm:space-y-20 sm:py-20">
        <Challenge />
        <BusinessRules />
        <Architecture />
        <Stack />
        <Patterns />
        <SolidPrinciples />
        <Security />
        <Persistence />
        <Quality />
        <FinalCta />
      </Container>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Secciones
// ---------------------------------------------------------------------------

function Hero() {
  return (
    <section className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 px-4 py-16 text-white sm:px-6 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider ring-1 ring-white/20">
          Prueba técnica · Desarrollador PHP
        </p>

        <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
          Sistema de Gestión Hotelera
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-brand-100 sm:text-lg">
          Aplicación web para administrar el inventario de hoteles de Decameron
          Colombia y la configuración de habitaciones de cada uno, haciendo
          cumplir por diseño las reglas del negocio.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/app"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-800 shadow-lg transition-transform hover:scale-[1.02] sm:w-auto"
          >
            Abrir la aplicación
            <span aria-hidden="true">→</span>
          </Link>

          <a
            href="#arquitectura"
            className="inline-flex w-full items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/30 transition-colors hover:bg-white/10 sm:w-auto"
          >
            Ver la arquitectura
          </a>
        </div>

        <dl className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
          {QUALITY.map((item) => (
            <div key={item.label} className="rounded-lg bg-white/5 p-3 ring-1 ring-white/10">
              <dt className="text-[0.7rem] uppercase tracking-wide text-brand-200">
                {item.label}
              </dt>
              <dd className="mt-1 text-lg font-bold leading-tight">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function Challenge() {
  return (
    <Section
      id="reto"
      eyebrow="El problema"
      title="Qué pide el negocio"
      lead="El gerente de operaciones hoteleras necesita registrar los hoteles de la compañía con sus datos tributarios, y asignar a cada uno tipos de habitación con su acomodación, sin que jamás se produzcan configuraciones inválidas."
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {[
          {
            title: 'Hoteles sin duplicar',
            detail: 'Nombre y NIT únicos en toda la compañía.',
          },
          {
            title: 'Acomodación acorde al tipo',
            detail: 'Cada tipo de habitación admite unas acomodaciones concretas y ninguna otra.',
          },
          {
            title: 'Sin combinaciones repetidas',
            detail: 'Un hotel no puede tener dos veces el mismo tipo con la misma acomodación.',
          },
          {
            title: 'Capacidad respetada',
            detail: 'La suma de habitaciones configuradas nunca supera el máximo del hotel.',
          },
          {
            title: 'Catálogos sin administración',
            detail: 'Ciudades, tipos y acomodaciones son datos fijos, sin pantallas de gestión.',
          },
          {
            title: 'Portátiles de 13 y 15 pulgadas',
            detail: 'La interfaz se diseñó para el equipo que los gerentes usan realmente.',
          },
        ].map((item) => (
          <li
            key={item.title}
            className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200"
          >
            <p className="font-semibold text-slate-900">{item.title}</p>
            <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}

function BusinessRules() {
  const { accommodations, types } = ACCOMMODATION_MATRIX

  return (
    <Section
      id="reglas"
      eyebrow="Regla central"
      title="Qué acomodación admite cada tipo"
      lead="Esta matriz gobierna todo el sistema. Vive codificada como clases de estrategia en el dominio, y de ahí se deriva la tabla de catálogo que consulta la interfaz: una sola fuente de verdad, nunca dos copias que puedan divergir."
    >
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full min-w-125 text-sm">
          <caption className="sr-only">
            Acomodaciones permitidas para cada tipo de habitación
          </caption>
          <thead>
            <tr className="border-b border-slate-200">
              <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700">
                Tipo de habitación
              </th>
              {accommodations.map((accommodation) => (
                <th
                  key={accommodation}
                  scope="col"
                  className="px-4 py-3 text-center font-semibold text-slate-700"
                >
                  {accommodation}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {types.map((type) => (
              <tr key={type.name}>
                <th scope="row" className="px-4 py-3 text-left font-medium text-slate-900">
                  {type.name}
                </th>
                {type.allowed.map((isAllowed, index) => (
                  <td key={accommodations[index]} className="px-4 py-3 text-center">
                    {/* El texto accesible acompaña siempre al símbolo: el color
                        y el icono por sí solos no comunican a todo el mundo. */}
                    <span
                      className={
                        isAllowed
                          ? 'inline-flex size-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600'
                          : 'inline-flex size-7 items-center justify-center rounded-full bg-slate-50 text-slate-300'
                      }
                    >
                      <span aria-hidden="true">{isAllowed ? '✓' : '—'}</span>
                      <span className="sr-only">
                        {isAllowed ? 'Permitida' : 'No permitida'}
                      </span>
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-slate-600">
        En la aplicación esta regla no se enuncia: se hace cumplir. Al elegir un
        tipo de habitación, el selector de acomodación ofrece únicamente las
        opciones válidas, y el servidor vuelve a comprobarlo antes de escribir
        nada.
      </p>
    </Section>
  )
}

function Architecture() {
  return (
    <Section
      id="arquitectura"
      eyebrow="Arquitectura"
      title="Backend y frontend desacoplados"
      lead="Son dos aplicaciones independientes, con su propio ciclo de vida y su propio despliegue. El único contrato entre ellas es HTTP con JSON."
    >
      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <ol className="space-y-3">
          {[
            {
              layer: 'Rutas y middleware',
              detail: 'CORS, límite de peticiones, autenticación opcional y cabeceras de seguridad.',
            },
            {
              layer: 'Controlador',
              detail: 'Traduce HTTP y delega. No contiene ni una regla de negocio.',
            },
            {
              layer: 'FormRequest',
              detail: '¿Está bien formada la petición? Tipos, obligatoriedad y formato.',
            },
            {
              layer: 'DTO',
              detail: 'Objeto inmutable que cruza la frontera hacia el dominio.',
            },
            {
              layer: 'Servicio',
              detail: '¿Tiene sentido en el negocio? Aquí viven las tres reglas, en transacción con bloqueo.',
            },
            {
              layer: 'Repositorio (interfaz)',
              detail: 'El dominio declara qué necesita de la persistencia.',
            },
            {
              layer: 'Implementación Eloquent',
              detail: 'Único punto que sabe que los datos viven en PostgreSQL.',
            },
            {
              layer: 'API Resource',
              detail: 'Decide qué se expone, protegiendo el contrato público.',
            },
          ].map((step, index) => (
            <li key={step.layer} className="flex gap-4">
              <span
                className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-800"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-slate-900">{step.layer}</p>
                <p className="text-sm text-slate-600">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-6 border-t border-slate-200 pt-5 text-sm text-slate-600">
          <strong className="font-semibold text-slate-900">
            Las dependencias apuntan hacia adentro.
          </strong>{' '}
          El dominio no importa nada de HTTP ni de la infraestructura, así que el
          mismo núcleo podría exponerse por consola, por una cola de trabajos o
          por GraphQL sin tocar una línea de lógica.
        </p>
      </div>
    </Section>
  )
}

function Stack() {
  return (
    <Section
      id="stack"
      eyebrow="Tecnología"
      title="Qué se usó y para qué"
      lead="Cada pieza responde a una necesidad concreta del enunciado, no a una preferencia."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <TechColumn title="Backend" items={BACKEND_STACK} tone="brand" />
        <TechColumn title="Frontend" items={FRONTEND_STACK} tone="accent" />
      </div>
    </Section>
  )
}

function TechColumn({
  title,
  items,
  tone,
}: {
  title: string
  items: typeof BACKEND_STACK
  tone: 'brand' | 'accent'
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.name}>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-semibold text-slate-900">{item.name}</span>
              <span
                className={
                  tone === 'brand'
                    ? 'rounded bg-brand-50 px-1.5 py-0.5 font-mono text-xs text-brand-700'
                    : 'rounded bg-cyan-50 px-1.5 py-0.5 font-mono text-xs text-cyan-700'
                }
              >
                {item.version}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-slate-600">{item.role}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Patterns() {
  return (
    <Section
      id="patrones"
      eyebrow="Patrones de diseño"
      title="Qué se aplicó y por qué"
      lead="Un patrón sin motivo es complejidad gratuita. Cada uno de estos resuelve un problema concreto de este sistema."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {PATTERNS.map((pattern) => (
          <article
            key={pattern.name}
            className="flex flex-col rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <h3 className="font-semibold text-slate-900">{pattern.name}</h3>
            <p className="mt-2 text-sm text-slate-600">{pattern.what}</p>
            <p className="mt-3 flex-1 text-sm text-slate-600">
              <span className="font-medium text-slate-800">Por qué: </span>
              {pattern.why}
            </p>
            <p className="mt-4 border-t border-slate-100 pt-3 font-mono text-xs text-slate-500">
              {pattern.where}
            </p>
          </article>
        ))}
      </div>
    </Section>
  )
}

function SolidPrinciples() {
  return (
    <Section
      id="solid"
      eyebrow="Principios SOLID"
      title="Aplicados, no citados"
      lead="Cada principio con el punto exacto del código donde se materializa."
    >
      <ul className="space-y-3">
        {SOLID.map((principle) => (
          <li
            key={principle.letter}
            className="flex gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <span
              className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-700 text-lg font-bold text-white"
              aria-hidden="true"
            >
              {principle.letter}
            </span>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900">{principle.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{principle.applied}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}

function Security() {
  return (
    <Section
      id="seguridad"
      eyebrow="Seguridad"
      title="Defensa en profundidad"
      lead="Ninguna medida basta por sí sola; el objetivo es que un fallo en una capa no comprometa el sistema entero."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {SECURITY.map((item) => (
          <div
            key={item.title}
            className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200"
          >
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="text-emerald-500" aria-hidden="true">
                🔒
              </span>
              {item.title}
            </h3>
            <p className="mt-1.5 text-sm text-slate-600">{item.detail}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

function Persistence() {
  return (
    <Section
      id="persistencia"
      eyebrow="Persistencia"
      title="La base de datos también hace cumplir las reglas"
      lead="La validación de la aplicación produce buenos mensajes de error; sólo el motor garantiza la invariante frente a escrituras concurrentes."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {PERSISTENCE.map((item) => (
          <div
            key={item.title}
            className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200"
          >
            <h3 className="font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-1.5 text-sm text-slate-600">{item.detail}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

function Quality() {
  return (
    <Section
      id="calidad"
      eyebrow="Calidad"
      title="Cómo se verifica que todo esto es cierto"
      lead="Las afirmaciones anteriores no se sostienen solas: cada una tiene una prueba que la respalda y un pipeline que la ejecuta en cada cambio."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: 'Pruebas unitarias',
            detail:
              'Las doce combinaciones posibles de tipo y acomodación —las siete válidas y las cinco que deben rechazarse—, los casos frontera de capacidad y una prueba que demuestra el principio Abierto/Cerrado añadiendo un tipo sin modificar código existente.',
          },
          {
            title: 'Pruebas de integración',
            detail:
              'Cada endpoint con sus casos de éxito y de rechazo, ejecutados contra PostgreSQL real y no contra SQLite en memoria: el esquema usa CHECK e índices parciales que otro motor no reproduce.',
          },
          {
            title: 'Integración continua',
            detail:
              'En cada push y cada pull request: estilo de código, análisis estático, pruebas de backend y frontend, y compilación. Un fallo impide integrar el cambio.',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <h3 className="font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

function FinalCta() {
  return (
    <section className="rounded-2xl bg-gradient-to-br from-brand-800 to-brand-950 px-6 py-12 text-center text-white">
      <h2 className="text-2xl font-bold sm:text-3xl">
        Probar la aplicación
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-brand-100">
        Incluye el hotel del ejemplo del enunciado, ya configurado con sus 42
        habitaciones, y otros casos para ver la interfaz en distintos estados.
      </p>
      <Link
        to="/app"
        className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-800 shadow-lg transition-transform hover:scale-[1.02]"
      >
        Ir al listado de hoteles
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Utilidades de maquetación
// ---------------------------------------------------------------------------

/**
 * Sección con encabezado consistente.
 *
 * El `id` alimenta los enlaces internos de la página, y el `aria-labelledby`
 * hace que los lectores de pantalla puedan enumerar las secciones y saltar
 * entre ellas.
 */
function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  lead: string
  children: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20">
      <header className="mb-6 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
          {eyebrow}
        </p>
        <h2
          id={`${id}-title`}
          className="mt-1.5 text-2xl font-bold text-slate-900 sm:text-3xl"
        >
          {title}
        </h2>
        <p className="mt-3 text-slate-600">{lead}</p>
      </header>

      {children}
    </section>
  )
}
