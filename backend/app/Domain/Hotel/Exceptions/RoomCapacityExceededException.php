<?php

declare(strict_types=1);

namespace App\Domain\Hotel\Exceptions;

use App\Domain\Shared\Exceptions\DomainException;

/**
 * La asignación solicitada haría que el hotel superara su máximo de
 * habitaciones.
 *
 * Corresponde al criterio del enunciado: «La cantidad de habitaciones
 * configuradas no deben superar el máximo por hotel.»
 */
final class RoomCapacityExceededException extends DomainException
{
    public function __construct(
        private readonly string $hotelName,
        private readonly int $maxRooms,
        private readonly int $occupiedRooms,
        private readonly int $requestedQuantity,
    ) {
        $available = max(0, $this->maxRooms - $this->occupiedRooms);

        // Se informa explícitamente cuántas habitaciones quedan disponibles:
        // así el gerente sabe qué cantidad sí puede registrar sin tener que
        // probar por ensayo y error.
        parent::__construct(
            $available === 0
                ? sprintf(
                    'El hotel "%s" ya tiene configuradas sus %d habitaciones. No quedan disponibles.',
                    $this->hotelName,
                    $this->maxRooms,
                )
                : sprintf(
                    'No se pueden configurar %d habitaciones en "%s": sólo quedan %d disponibles de un máximo de %d.',
                    $this->requestedQuantity,
                    $this->hotelName,
                    $available,
                    $this->maxRooms,
                )
        );
    }

    public function errorCode(): string
    {
        return 'ROOM_CAPACITY_EXCEEDED';
    }

    /**
     * @return array<string, list<string>>
     */
    public function errors(): array
    {
        return [
            'quantity' => [$this->getMessage()],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function context(): array
    {
        return [
            'max_rooms' => $this->maxRooms,
            'occupied_rooms' => $this->occupiedRooms,
            'available_rooms' => max(0, $this->maxRooms - $this->occupiedRooms),
            'requested_quantity' => $this->requestedQuantity,
        ];
    }
}
