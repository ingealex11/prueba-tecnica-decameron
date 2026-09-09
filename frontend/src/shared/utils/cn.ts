/**
 * Une clases CSS descartando los valores vacíos.
 *
 * Permite escribir clases condicionales sin acabar con cadenas que contienen
 * "false" o "undefined" literales:
 *
 *     cn('base', isActive && 'activo', className)
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
