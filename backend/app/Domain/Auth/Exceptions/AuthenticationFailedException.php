<?php

declare(strict_types=1);

namespace App\Domain\Auth\Exceptions;

use App\Domain\Shared\Exceptions\DomainException;

/**
 * Fallos del proceso de autenticación.
 *
 * Los mensajes están redactados con cuidado deliberado. Decir «ese correo no
 * existe» le confirma a quien prueba credenciales qué cuentas hay en el
 * sistema, así que las credenciales inválidas se responden siempre igual, sin
 * distinguir si falló el correo o la contraseña.
 *
 * En cambio, los fallos del segundo factor sí se detallan: quien llega ahí ya
 * demostró conocer la contraseña, y ocultarle que su código caducó sólo le haría
 * reintentarlo en balde.
 */
final class AuthenticationFailedException extends DomainException
{
    /**
     * Los nombres evitan `$code`: `\Exception` ya declara esa propiedad como
     * no readonly, y redeclararla como readonly es un error fatal en PHP.
     */
    private function __construct(
        string $message,
        private readonly string $failureCode,
        private readonly int $httpStatus,
        /** @var array<string, list<string>> */
        private readonly array $fieldErrors = [],
        /** @var array<string, mixed> */
        private readonly array $extra = [],
    ) {
        parent::__construct($message);
    }

    /** Correo o contraseña incorrectos. */
    public static function invalidCredentials(): self
    {
        return new self(
            'Las credenciales indicadas no son correctas.',
            'INVALID_CREDENTIALS',
            401,
            ['email' => ['Las credenciales indicadas no son correctas.']],
        );
    }

    /** El desafío no existe, ya se usó o se agotaron sus intentos. */
    public static function challengeNotFound(): self
    {
        return new self(
            'La verificación no es válida o ya fue utilizada. Inicie sesión de nuevo.',
            'INVALID_CHALLENGE',
            401,
        );
    }

    /** El código caducó antes de introducirse. */
    public static function challengeExpired(): self
    {
        return new self(
            'El código de verificación caducó. Inicie sesión de nuevo para recibir uno nuevo.',
            'CHALLENGE_EXPIRED',
            401,
        );
    }

    /** El código introducido no coincide. */
    public static function invalidCode(int $attemptsRemaining): self
    {
        return new self(
            $attemptsRemaining > 0
                ? sprintf(
                    'El código no es correcto. Le %s %d %s.',
                    $attemptsRemaining === 1 ? 'queda' : 'quedan',
                    $attemptsRemaining,
                    $attemptsRemaining === 1 ? 'intento' : 'intentos',
                )
                : 'Se agotaron los intentos disponibles. Inicie sesión de nuevo.',
            'INVALID_TWO_FACTOR_CODE',
            422,
            ['code' => ['El código de verificación no es correcto.']],
            ['attempts_remaining' => $attemptsRemaining],
        );
    }

    public function statusCode(): int
    {
        return $this->httpStatus;
    }

    public function errorCode(): string
    {
        return $this->failureCode;
    }

    /**
     * @return array<string, list<string>>
     */
    public function errors(): array
    {
        return $this->fieldErrors;
    }

    /**
     * @return array<string, mixed>
     */
    public function context(): array
    {
        return $this->extra;
    }
}
