<?php

declare(strict_types=1);

namespace App\Domain\Hotel\Services;

use App\Domain\Hotel\Data\RoomAssignmentData;
use App\Models\HotelRoom;
use Illuminate\Database\Eloquent\Collection;

/**
 * Casos de uso de configuración de habitaciones de un hotel.
 */
interface RoomAssignmentServiceInterface
{
    /**
     * @return Collection<int, HotelRoom>
     */
    public function listForHotel(int $hotelId): Collection;

    public function assign(int $hotelId, RoomAssignmentData $data): HotelRoom;

    public function update(int $hotelId, int $roomId, RoomAssignmentData $data): HotelRoom;

    public function remove(int $hotelId, int $roomId): void;
}
