<?php

declare(strict_types=1);

namespace App\Domain\Auth\Services;

use App\Domain\Auth\Data\AuthenticatedSession;
use App\Domain\Auth\Data\TwoFactorIssued;
use App\Domain\Auth\Exceptions\AuthenticationFailedException;
use App\Models\TwoFactorChallenge;
use App\Models\User;
use Illuminate\Contracts\Hashing\Hasher;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\PersonalAccessToken;

/**
 * Autenticación en dos pasos.
 *
 * El inicio de sesión se divide en dos llamadas independientes:
 *
 *   1. `beginLogin` comprueba las credenciales y, si son correctas, emite un
 *      desafío con un código de seis dígitos. Devuelve el identificador del
 *      desafío, pero **no** un token de sesión.
 *
 *   2. `completeLogin` recibe ese identificador y el código. Sólo si coinciden
 *      se emite el token con el que el cliente podrá operar.
 *
 * Saber la contraseña no basta para entrar; hace falta también resolver el
 * desafío. Es lo que convierte esto en un segundo factor y no en una pantalla
 * intermedia decorativa.
 *
 * Sobre el canal de entrega: en un despliegue real el código viajaría por SMS
 * o correo. Aquí, en modo demostración, se devuelve en la propia respuesta para
 * que la aplicación pueda mostrarlo. La verificación es idéntica en ambos casos;
 * lo único que cambia es por dónde le llega el código a la persona.
 */
final readonly class AuthService
{
    public function __construct(
        private Hasher $hasher,
    ) {}

    /**
     * Primer paso: verifica las credenciales y emite un desafío.
     *
     * @throws AuthenticationFailedException si las credenciales no son válidas.
     */
    public function beginLogin(string $email, string $password): TwoFactorIssued
    {
        $user = User::query()->where('email', $email)->first();

        // La comparación de contraseña se hace incluso si el usuario no existe,
        // contra un hash ficticio. Sin esto, la respuesta sería más rápida para
        // correos inexistentes y esa diferencia de tiempo delataría qué cuentas
        // hay registradas.
        $storedHash = $user !== null
            ? $user->password
            : $this->hasher->make('sin-usuario');

        if ($user === null || ! $this->hasher->check($password, $storedHash)) {
            throw AuthenticationFailedException::invalidCredentials();
        }

        return DB::transaction(function () use ($user): TwoFactorIssued {
            // Un único desafío vigente por persona: iniciar sesión de nuevo
            // invalida el código anterior, que de otro modo seguiría siendo
            // válido hasta caducar.
            TwoFactorChallenge::query()
                ->where('user_id', $user->id)
                ->whereNull('consumed_at')
                ->delete();

            $code = $this->generateCode();

            $challenge = TwoFactorChallenge::query()->create([
                'user_id' => $user->id,
                'code_hash' => $this->hasher->make($code),
                'expires_at' => now()->addMinutes(TwoFactorChallenge::TTL_MINUTES),
            ]);

            return new TwoFactorIssued(
                challengeId: $challenge->id,
                expiresInSeconds: $challenge->secondsRemaining(),
                maskedDestination: $this->maskEmail($user->email),
                // Sólo se revela en modo demostración; en producción este campo
                // es nulo y el código viaja por su canal real.
                demoCode: config('hotel.two_factor.reveal_code') ? $code : null,
            );
        });
    }

    /**
     * Segundo paso: resuelve el desafío y emite el token de sesión.
     *
     * @throws AuthenticationFailedException si el desafío no es válido, caducó
     *                                       o el código no coincide.
     */
    public function completeLogin(string $challengeId, string $code, string $deviceName): AuthenticatedSession
    {
        $challenge = TwoFactorChallenge::query()
            ->with('user')
            ->find($challengeId);

        if ($challenge === null || ! $challenge->isPending()) {
            // Se distingue el caso de caducidad porque a quien ya demostró
            // conocer la contraseña le sirve saber que debe pedir otro código.
            if ($challenge !== null && $challenge->consumed_at === null && $challenge->expires_at->isPast()) {
                throw AuthenticationFailedException::challengeExpired();
            }

            throw AuthenticationFailedException::challengeNotFound();
        }

        if (! $this->hasher->check($code, $challenge->code_hash)) {
            // El intento fallido se registra fuera de cualquier transacción, de
            // forma deliberada: si se hiciera dentro de una y luego se lanzara
            // la excepción, el rollback desharía el incremento y el contador
            // de intentos nunca avanzaría. `increment` es una sentencia UPDATE
            // atómica, así que dos envíos simultáneos cuentan ambos.
            $challenge->increment('attempts');

            throw AuthenticationFailedException::invalidCode(
                $challenge->fresh()?->attemptsRemaining() ?? 0
            );
        }

        // Consumo atómico: el UPDATE sólo afecta a la fila si nadie la consumió
        // antes. Dos peticiones simultáneas con el código correcto compiten
        // aquí y sólo una obtiene el token; la otra recibe cero filas y falla.
        // Es equivalente a un bloqueo, sin mantener una transacción abierta.
        $consumed = TwoFactorChallenge::query()
            ->whereKey($challenge->id)
            ->whereNull('consumed_at')
            ->update(['consumed_at' => now()]);

        if ($consumed === 0) {
            throw AuthenticationFailedException::challengeNotFound();
        }

        $user = $challenge->user;

        // El nombre del dispositivo queda asociado al token: permite distinguir
        // sesiones y revocar una concreta sin cerrar las demás.
        $token = $user->createToken($deviceName)->plainTextToken;

        return new AuthenticatedSession(token: $token, user: $user);
    }

    /**
     * Cierra la sesión actual, revocando únicamente su token.
     *
     * Las sesiones abiertas en otros dispositivos siguen activas: cerrar
     * sesión en el portátil no debe expulsar a la misma persona del móvil.
     */
    public function logout(User $user): void
    {
        // La ruta de cierre de sesión exige `auth:sanctum`, de modo que llegar
        // aquí garantiza que la petición se autenticó con un token y que éste
        // está disponible como token actual.
        /** @var PersonalAccessToken $token */
        $token = $user->currentAccessToken();

        $token->delete();
    }

    /**
     * Código de seis dígitos con ceros a la izquierda.
     *
     * `random_int` es criptográficamente seguro; `rand` o `mt_rand` no lo son y
     * su secuencia puede predecirse.
     */
    private function generateCode(): string
    {
        return str_pad((string) random_int(0, 999_999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Oculta parte del correo para mostrar a dónde se envió el código sin
     * revelarlo entero: `gerente@decameron.test` pasa a `ge•••••@decameron.test`.
     */
    private function maskEmail(string $email): string
    {
        [$local, $domain] = explode('@', $email, 2) + [1 => ''];

        $visible = mb_substr($local, 0, 2);
        $hidden = str_repeat('•', max(3, mb_strlen($local) - 2));

        return $visible.$hidden.'@'.$domain;
    }
}
