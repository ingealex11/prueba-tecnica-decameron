<?php

declare(strict_types=1);

namespace App\Domain\Hotel\Exceptions;

use App\Domain\Shared\Exceptions\DomainException;

/**
 * Se intentó reducir el máximo de habitaciones de un hotel por debajo de las
 * que ya tiene configuradas.
 *
 * El enunciado no lo menciona de forma explícita, pero se deriva del criterio
 * «la cantidad de habitaciones configuradas no debe superar el máximo por
 * hotel»: si se permitiera bajar el tope sin comprobarlo, el hotel quedaría en
 * un estado que viola esa misma regla. Detectarlo aquí evita que el sistema
 * pueda llegar a un estado inconsistente por una operación de edición.
 */
final class MaxRoomsBelowConfiguredException extends DomainException
{
    public function __construct(
        private readonly string $hotelName,
        private readonly int $requestedMax,
        private readonly int $occupiedRooms,
    ) {
        parent::__construct(sprintf(
            'No se puede fijar el máximo de "%s" en %d habitaciones porque ya tiene %d configuradas. '.
            'Elimine o reduzca configuraciones antes de bajar el máximo.',
            $this->hotelName,
            $this->requestedMax,
            $this->occupiedRooms,
        ));
    }

    public function errorCode(): string
    {
        return 'MAX_ROOMS_BELOW_CONFIGURED';
    }

    /**
     * @return array<string, list<string>>
     */
    public function errors(): array
    {
        return [
            'max_rooms' => [$this->getMessage()],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function context(): array
    {
        return [
            'requested_max_rooms' => $this->requestedMax,
            'occupied_rooms' => $this->occupiedRooms,
        ];
    }
}
