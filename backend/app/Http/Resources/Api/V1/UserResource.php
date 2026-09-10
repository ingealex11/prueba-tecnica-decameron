<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Representación pública de la persona autenticada.
 *
 * Nunca incluye la contraseña ni sus hashes: el Resource es precisamente la
 * frontera que impide que un atributo sensible se filtre por accidente.
 *
 * @mixin User
 */
final class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            // Iniciales para el avatar, calculadas aquí para que todos los
            // clientes las deriven igual.
            'initials' => $this->initials(),
        ];
    }

    /**
     * Primera letra del primer y del último nombre.
     *
     * Se toma el último y no el segundo para que «Gerente de Operaciones» dé
     * «GO» y no «GD»: las partículas intermedias no forman parte del nombre.
     */
    private function initials(): string
    {
        $words = preg_split('/\s+/', trim($this->name)) ?: [];

        if ($words === []) {
            return '';
        }

        $first = mb_substr($words[0], 0, 1);
        $last = count($words) > 1 ? mb_substr($words[count($words) - 1], 0, 1) : '';

        return mb_strtoupper($first.$last);
    }
}
