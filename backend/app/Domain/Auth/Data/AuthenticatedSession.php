<?php

declare(strict_types=1);

namespace App\Domain\Auth\Data;

use App\Models\User;

/**
 * Resultado del segundo paso de autenticación: una sesión abierta.
 */
final readonly class AuthenticatedSession
{
    public function __construct(
        /** Token de Sanctum en claro; sólo se muestra esta vez. */
        public string $token,
        public User $user,
    ) {}
}
