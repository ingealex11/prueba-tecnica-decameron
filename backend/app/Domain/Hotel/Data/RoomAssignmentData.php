<?php

declare(strict_types=1);

namespace App\Domain\Hotel\Data;

/**
 * Datos de una asignación de habitaciones a un hotel: cuántas habitaciones de
 * qué tipo y con qué acomodación.
 */
final readonly class RoomAssignmentData
{
    public function __construct(
        public int $roomTypeId,
        public int $accommodationId,
        public int $quantity,
    ) {}

    /**
     * @param  array<string, mixed>  $validated
     */
    public static function fromArray(array $validated): self
    {
        return new self(
            roomTypeId: (int) $validated['room_type_id'],
            accommodationId: (int) $validated['accommodation_id'],
            quantity: (int) $validated['quantity'],
        );
    }

    /**
     * Representación lista para persistir, asociada a un hotel concreto.
     *
     * @return array<string, mixed>
     */
    public function toArray(int $hotelId): array
    {
        return [
            'hotel_id' => $hotelId,
            'room_type_id' => $this->roomTypeId,
            'accommodation_id' => $this->accommodationId,
            'quantity' => $this->quantity,
        ];
    }
}
