<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent;

use App\Domain\Hotel\Data\RoomAssignmentData;
use App\Domain\Hotel\Repositories\RoomRepositoryInterface;
use App\Models\HotelRoom;
use Illuminate\Database\Eloquent\Collection;

/**
 * Implementación con Eloquent del repositorio de configuraciones de habitación.
 */
final class EloquentRoomRepository implements RoomRepositoryInterface
{
    /**
     * @return Collection<int, HotelRoom>
     */
    public function forHotel(int $hotelId): Collection
    {
        return HotelRoom::query()
            ->with(['roomType', 'accommodation'])
            ->where('hotel_id', $hotelId)
            ->join('room_types', 'room_types.id', '=', 'hotel_rooms.room_type_id')
            ->orderBy('room_types.sort_order')
            ->select('hotel_rooms.*')
            ->get();
    }

    public function findById(int $id): ?HotelRoom
    {
        return HotelRoom::query()
            ->with(['roomType', 'accommodation', 'hotel'])
            ->find($id);
    }

    public function sumQuantities(int $hotelId, ?int $exceptRoomId = null): int
    {
        return (int) HotelRoom::query()
            ->where('hotel_id', $hotelId)
            ->when($exceptRoomId !== null, fn ($query) => $query->whereKeyNot($exceptRoomId))
            ->sum('quantity');
    }

    public function existsCombination(
        int $hotelId,
        int $roomTypeId,
        int $accommodationId,
        ?int $exceptRoomId = null,
    ): bool {
        return HotelRoom::query()
            ->where('hotel_id', $hotelId)
            ->where('room_type_id', $roomTypeId)
            ->where('accommodation_id', $accommodationId)
            ->when($exceptRoomId !== null, fn ($query) => $query->whereKeyNot($exceptRoomId))
            ->exists();
    }

    public function create(int $hotelId, RoomAssignmentData $data): HotelRoom
    {
        $room = HotelRoom::query()->create($data->toArray($hotelId));

        return $room->load(['roomType', 'accommodation']);
    }

    public function update(HotelRoom $room, RoomAssignmentData $data): HotelRoom
    {
        $room->update($data->toArray($room->hotel_id));

        return $room->fresh(['roomType', 'accommodation']) ?? $room;
    }

    public function delete(HotelRoom $room): void
    {
        $room->delete();
    }
}
