import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, KeyRound, LogIn, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useAuth } from '@/features/auth/authContext'
import { Alert } from '@/shared/components/Alert'
import { Button } from '@/shared/components/Button'
import { Field } from '@/shared/components/Field'
import { useServerErrors } from '@/shared/hooks/useServerErrors'
import { controlClasses } from '@/shared/utils/formControls'

const schema = z.object({
  email: z.string().trim().email('Indique un correo electrónico válido.'),
  password: z.string().min(1, 'Indique su contraseña.'),
})

type FormValues = z.infer<typeof schema>

/** Credenciales de la instancia de demostración; el seeder las crea. */
const DEMO = { email: 'gerente@decameron.test', password: 'decameron2026' }

/**
 * Paso 1 del inicio de sesión: credenciales.
 *
 * Al validarse, no se entra todavía: se navega a la pantalla del código de
 * verificación llevando el desafío emitido por el servidor.
 */
export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/app'

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } })

  const { generalError, applyServerErrors, clearGeneralError } = useServerErrors<FormValues>(setError)

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const submit = handleSubmit(async (values) => {
    clearGeneralError()

    try {
      const challenge = await login(values.email, values.password)
      navigate('/login/verificar', { state: { challenge, email: values.email, from } })
    } catch (error) {
      applyServerErrors(error)
    }
  })

  const fillDemo = () => {
    setValue('email', DEMO.email, { shouldValidate: true })
    setValue('password', DEMO.password, { shouldValidate: true })
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <KeyRound className="size-6" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Iniciar sesión</h1>
        <p className="text-sm text-ink-2">Introduzca sus credenciales. Después se le pedirá un código de verificación.</p>
      </header>

      <form onSubmit={submit} noValidate className="space-y-5">
        {generalError && <Alert tone="error">{generalError}</Alert>}

        <Field label="Correo electrónico" error={errors.email?.message} required>
          {(props) => (
            <input
              {...props}
              {...register('email')}
              type="email"
              autoComplete="username"
              placeholder="nombre@decameron.com"
              className={controlClasses(Boolean(errors.email))}
            />
          )}
        </Field>

        <Field label="Contraseña" error={errors.password?.message} required>
          {(props) => (
            <div className="relative">
              <input
                {...props}
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••••"
                className={controlClasses(Boolean(errors.password)) + ' pr-11'}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 grid w-11 place-items-center text-ink-3 hover:text-ink"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          )}
        </Field>

        <Button type="submit" size="lg" isLoading={isSubmitting} icon={<LogIn />} className="w-full">
          Continuar
        </Button>
      </form>

      <div className="rounded-xl border border-dashed border-line-strong bg-surface-2/60 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-medium text-ink">Instancia de demostración</p>
            <p className="mt-0.5 text-ink-2">
              Usuario <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs text-ink">{DEMO.email}</code>{' '}
              · contraseña <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs text-ink">{DEMO.password}</code>
            </p>
            <button type="button" onClick={fillDemo} className="mt-2 text-sm font-medium text-accent hover:underline">
              Rellenar credenciales de prueba
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
