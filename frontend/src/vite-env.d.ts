/// <reference types="vite/client" />

/**
 * Variables de entorno de la aplicación.
 *
 * Declararlas aquí hace que TypeScript avise si se lee una que no existe, en
 * lugar de dejar que llegue `undefined` hasta el tiempo de ejecución.
 *
 * Sólo las variables con prefijo `VITE_` llegan al navegador: es la salvaguarda
 * de Vite para que un secreto del servidor no acabe incrustado en el paquete
 * que se descarga el usuario.
 */
interface ImportMetaEnv {
  /** URL base de la API, incluida la versión. */
  readonly VITE_API_URL?: string

  /**
   * Token de Sanctum, sólo necesario si la API se despliega con la
   * autenticación activada.
   */
  readonly VITE_API_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
