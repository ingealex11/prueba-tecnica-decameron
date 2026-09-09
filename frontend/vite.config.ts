/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

/**
 * Configuración de Vite para desarrollo, compilación y pruebas.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      // Evita las cadenas de `../../../` al importar entre carpetas: los
      // imports quedan estables aunque un archivo cambie de sitio.
      //
      // La ruta se deriva de `import.meta.url` en lugar de `__dirname`, que no
      // existe en módulos ES y que el cargador nativo de Vite ya no admite.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    port: 5173,
    // Falla en lugar de saltar a otro puerto: el backend tiene 5173 en su lista
    // de orígenes CORS, y un cambio silencioso provocaría errores difíciles de
    // diagnosticar.
    strictPort: true,
  },

  build: {
    // Los mapas de código permiten depurar el paquete ya compilado sin exponer
    // el código fuente en la respuesta.
    sourcemap: true,
  },

  test: {
    // `globals` habilita describe/it/expect sin importarlos en cada archivo.
    globals: true,
    // jsdom aporta un DOM simulado: sin él no se pueden renderizar componentes.
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      // Se excluyen los archivos sin lógica propia: medirlos infla la cobertura
      // sin que eso signifique que algo esté mejor probado.
      exclude: [
        'node_modules/',
        'src/test/',
        'src/main.tsx',
        'src/vite-env.d.ts',
        '**/*.config.*',
        '**/*.d.ts',
      ],
    },
  },
})
