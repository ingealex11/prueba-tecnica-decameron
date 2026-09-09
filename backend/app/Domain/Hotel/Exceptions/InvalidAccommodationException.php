<?php

declare(strict_types=1);

namespace App\Domain\Hotel\Exceptions;

use App\Domain\Shared\Exceptions\DomainException;

/**
 * Se intentó asignar una acomodación que el tipo de habitación no admite.
 *
 * Corresponde a la regla central del enunciado:
 *
 *   - Estándar -> Sencilla o Doble
 *   - Junior   -> Triple o Cuádruple
 *   - Suite    -> Sencilla, Doble o Triple
 */
final class InvalidAccommodationException extends DomainException
{
    /**
     * @param  string        $roomTypeName       Tipo que se intentó configurar.
     * @param  string        $accommodationName  Acomodación rechazada.
     * @param  list<string>  $allowed            Acomodaciones que sí admite el tipo.
     */
    public function __construct(
        private readonly string $roomTypeName,
        private readonly string $accommodationName,
        private readonly array $allowed,
    ) {
        // El mensaje enumera las opciones válidas: decirle al usuario qué está
        // mal sin decirle qué sí puede hacer lo obliga a adivinar.
        parent::__construct(sprintf(
            'La acomodación "%s" no es válida para el tipo de habitación "%s". Opciones permitidas: %s.',
            $this->accommodationName,
            $this->roomTypeName,
            implode(', ', $this->allowed),
        ));
    }

    public function errorCode(): string
    {
        return 'INVALID_ACCOMMODATION_FOR_ROOM_TYPE';
    }

    /**
     * @return array<string, list<string>>
     */
    public function errors(): array
    {
        return [
            'accommodation_id' => [$this->getMessage()],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function context(): array
    {
        return [
            'room_type' => $this->roomTypeName,
            'accommodation' => $this->accommodationName,
            'allowed_accommodations' => $this->allowed,
        ];
    }
}
