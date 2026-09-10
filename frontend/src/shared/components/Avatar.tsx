import { cn } from '@/shared/utils/cn'

/**
 * Avatar con iniciales.
 *
 * El color se deriva del nombre de forma determinista, para que la misma
 * persona tenga siempre el mismo color sin necesidad de guardarlo.
 */
export function Avatar({
  name,
  initials,
  size = 'md',
  className,
}: {
  name: string
  initials: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const hue = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360

  const sizes = { sm: 'size-7 text-[0.65rem]', md: 'size-9 text-xs', lg: 'size-12 text-sm' }

  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-full font-semibold text-white ring-2 ring-white/20',
        sizes[size],
        className,
      )}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 50%), hsl(${(hue + 40) % 360} 70% 40%))` }}
    >
      {initials}
    </span>
  )
}
