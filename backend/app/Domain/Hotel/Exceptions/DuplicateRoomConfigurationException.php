<?php

declare(strict_types=1);

namespace App\Domain\Hotel\Exceptions;

use App\Domain\Shared\Exceptions\DomainException;

/**
 * El hotel ya tiene configurada esa combinación de tipo y acomodación.
 *
 * Corresponde al criterio del enunciado: «No debe existir tipos de habitaciones
 * y acomodaciones repetidas para el mismo hotel.»
 *
 * Se responde con 409 Conflict, y no con 422, porque la petición es
 * semánticamente válida: el conflicto está en el estado actual del recurso, no
 * en los datos enviados. La acción correcta del cliente es editar la
 * configuración existente en lugar de crear otra.
 */
final class DuplicateRoomConfigurationException extends DomainException
{
    public function __construct(
        private readonly string $hotelName,
        private readonly string $roomTypeName,
        private readonly string $accommodationName,
    ) {
        parent::__construct(sprintf(
            'El hotel "%s" ya tiene una configuración de habitación "%s" con acomodación "%s". '.
            'Edite la configuración existente en lugar de crear una nueva.',
            $this->hotelName,
            $this->roomTypeName,
            $this->accommodationName,
        ));
    }

    public function statusCode(): int
    {
        return 409;
    }

    public function errorCode(): string
    {
        return 'DUPLICATE_ROOM_CONFIGURATION';
    }

    /**
     * @return array<string, list<string>>
     */
    public function errors(): array
    {
        return [
            'room_type_id' => [$this->getMessage()],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function context(): array
    {
        return [
            'hotel' => $this->hotelName,
            'room_type' => $this->roomTypeName,
            'accommodation' => $this->accommodationName,
        ];
    }
}
