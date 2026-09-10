import { ArrowLeft, MailCheck, ShieldCheck, Smartphone, TimerReset } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '@/features/auth/authContext'
import { ApiRequestError } from '@/shared/api/client'
import type { TwoFactorChallenge } from '@/shared/api/types'
import { Alert } from '@/shared/components/Alert'
import { Button } from '@/shared/components/Button'
import { OtpInput } from '@/shared/components/OtpInput'

interface LocationState {
  challenge: TwoFactorChallenge
  email: string
  from: string
}

/**
 * Paso 2 del inicio de sesión: el código de verificación.
 *
 * El desafío llega en el estado de navegación desde la pantalla anterior; si
 * alguien abre esta ruta directamente, no hay nada que verificar y se le lleva
 * al inicio de sesión.
 *
 * En modo demostración el servidor devuelve el código y se muestra aquí, como
 * si fuera la notificación que llegaría al teléfono. En producción ese campo
 * viene vacío y el código llega por su canal real; la pantalla es la misma.
 */
export function TwoFactorPage() {
  const { verify } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(state?.challenge.expires_in ?? 0)

  // Cuenta atrás de validez del código.
  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(timer)
  }, [secondsLeft])

  if (!state?.challenge) {
    return <Navigate to="/login" replace />
  }

  const { challenge, email, from } = state
  const expired = secondsLeft === 0

  const submit = async (value: string) => {
    if (value.length !== 6 || isVerifying) return

    setIsVerifying(true)
    setError(null)

    try {
      await verify(challenge.challenge_id, value)
      navigate(from, { replace: true })
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message)
        const remaining = err.context.attempts_remaining
        setAttemptsLeft(typeof remaining === 'number' ? remaining : null)

        // Desafío agotado o caducado: hay que volver a empezar.
        if (err.code === 'INVALID_CHALLENGE' || err.code === 'CHALLENGE_EXPIRED') {
          setSecondsLeft(0)
        }
      } else {
        setError('Ocurrió un error inesperado. Intente de nuevo.')
      }
      setCode('')
    } finally {
      setIsVerifying(false)
    }
  }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = String(secondsLeft % 60).padStart(2, '0')

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <ShieldCheck className="size-6" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Verificación en dos pasos</h1>
        <p className="text-sm text-ink-2">
          Enviamos un código de seis dígitos a <span className="font-medium text-ink">{challenge.sent_to}</span>.
          Introdúzcalo para completar el acceso.
        </p>
      </header>

      {/* Simulación del canal de entrega: en producción esto sería un SMS o
          un correo; aquí se muestra en pantalla para que pueda probarse. */}
      {challenge.demo_code && !expired && (
        <div className="relative overflow-hidden rounded-2xl bg-sidebar p-4 text-white shadow-pop ring-1 ring-white/10 animate-fade-up">
          <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-brand-500/30 blur-2xl" aria-hidden="true" />
          <div className="relative flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10">
              <Smartphone className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-white/60">Mensaje simulado · Decameron</p>
                <p className="text-[0.7rem] text-white/50">ahora</p>
              </div>
              <p className="mt-1 text-sm text-white/85">
                Su código de verificación es{' '}
                <span className="font-mono text-lg font-bold tracking-[0.25em] text-white">{challenge.demo_code}</span>.
                Caduca en {minutes}:{seconds}.
              </p>
              <button
                type="button"
                onClick={() => submit(challenge.demo_code as string)}
                className="mt-2 text-xs font-medium text-brand-300 hover:underline"
              >
                Usar este código
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {error && <Alert tone="error">{error}</Alert>}

        {expired ? (
          <Alert tone="warning" title="El código ya no es válido">
            Vuelva a iniciar sesión para recibir uno nuevo.
          </Alert>
        ) : (
          <OtpInput value={code} onChange={setCode} onComplete={submit} disabled={isVerifying} hasError={Boolean(error)} />
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-1.5 text-ink-3">
            <TimerReset className="size-4" aria-hidden="true" />
            {expired ? 'Caducado' : `Válido ${minutes}:${seconds}`}
          </span>
          {attemptsLeft !== null && !expired && (
            <span className="text-ink-3">
              {attemptsLeft} {attemptsLeft === 1 ? 'intento restante' : 'intentos restantes'}
            </span>
          )}
        </div>

        {expired ? (
          <Button size="lg" className="w-full" icon={<MailCheck />} onClick={() => navigate('/login', { replace: true })}>
            Solicitar un código nuevo
          </Button>
        ) : (
          <Button size="lg" className="w-full" isLoading={isVerifying} disabled={code.length !== 6} onClick={() => submit(code)}>
            Verificar y entrar
          </Button>
        )}
      </div>

      <p className="text-center text-sm text-ink-3">
        <Link to="/login" className="inline-flex items-center gap-1.5 font-medium text-ink-2 hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver, no soy {email}
        </Link>
      </p>
    </div>
  )
}
