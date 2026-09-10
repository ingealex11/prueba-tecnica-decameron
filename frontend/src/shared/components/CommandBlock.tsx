import { Check, Copy, Terminal } from 'lucide-react'
import { useState } from 'react'

/**
 * Bloque de órdenes de terminal con botón de copiar.
 *
 * Copiar todas las líneas de un paso de una sola vez evita transcribir a mano
 * comandos largos, que es donde suelen colarse las erratas cuando alguien
 * sigue una guía por primera vez. El botón va en una barra propia, y no
 * flotando sobre el texto, para que nunca tape una orden larga.
 */
export function CommandBlock({ commands }: { commands: string[] }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(commands.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Sin permiso de portapapeles el texto sigue siendo seleccionable.
    }
  }

  return (
    <div className="overflow-hidden rounded-xl bg-sidebar text-[0.8125rem] text-white/90 ring-1 ring-white/10">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <span className="inline-flex items-center gap-1.5 text-xs text-white/50">
          <Terminal className="size-3.5" aria-hidden="true" />
          Terminal
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? 'Copiado' : 'Copiar órdenes'}
          className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check className="size-3.5 text-teal-400" /> : <Copy className="size-3.5" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono leading-relaxed">
        {commands.map((c) => (
          <div key={c} className="whitespace-pre">
            <span className="select-none text-white/35">$ </span>
            {c}
          </div>
        ))}
      </pre>
    </div>
  )
}
