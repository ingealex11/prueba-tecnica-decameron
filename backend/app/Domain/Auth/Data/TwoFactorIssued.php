<?php

declare(strict_types=1);

namespace App\Domain\Auth\Data;

/**
 * Resultado del primer paso de autenticación: un desafío pendiente.
 *
 * No contiene ningún token. Lo único que el cliente recibe es el identificador
 * con el que deberá resolver el desafío y la información necesaria para guiar
 * a la persona: cuánto tiempo tiene y a dónde se envió el código.
 */
final readonly class TwoFactorIssued
{
    public function __construct(
        public string $challengeId,
        public int $expiresInSeconds,
        /** Destino enmascarado, para mostrar sin revelar el correo entero. */
        public string $maskedDestination,
        /**
         * Código en claro, presente únicamente en modo demostración.
         *
         * En un despliegue real este valor es siempre nulo y el código viaja
         * por SMS o correo; aquí se expone para que la aplicación pueda
         * mostrarlo y quien evalúe no dependa de una bandeja de entrada.
         */
        public ?string $demoCode = null,
    ) {}
}
