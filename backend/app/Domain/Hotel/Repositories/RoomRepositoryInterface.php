<?php

declare(strict_types=1);

namespace App\Domain\Hotel\Repositories;

use App\Domain\Hotel\Data\RoomAssignmentData;
use App\Models\HotelRoom;
use Illuminate\Database\Eloquent\Collection;

/**
 * Contrato de persistencia de las configuraciones de habitación de un hotel.
 */
interface RoomRepositoryInterface
{
    /**
     * Configuraciones de un hotel, con tipo y acomodación ya cargados.
     *
     * @return Collection<int, HotelRoom>
     */
    public function forHotel(int $hotelId): Collection;

    public function findById(int $id): ?HotelRoom;

    /**
     * Suma de habitaciones ya configuradas en un hotel.
     *
     * @param  int|null  $exceptRoomId  Configuración a excluir del total. Se usa
     *                                  al editar: la cantidad que se está
     *                                  reemplazando no debe contarse contra el
     *                                  máximo, o toda edición al alza fallaría.
     */
    public function sumQuantities(int $hotelId, ?int $exceptRoomId = null): int;

    /**
     * Indica si el hotel ya tiene configurada esa combinación.
     *
     * @param  int|null  $exceptRoomId  Configuración a excluir, para que al
     *                                  editar no se detecte a sí misma.
     */
    public function existsCombination(
        int $hotelId,
        int $roomTypeId,
        int $accommodationId,
        ?int $exceptRoomId = null,
    ): bool;

    public function create(int $hotelId, RoomAssignmentData $data): HotelRoom;

    public function update(HotelRoom $room, RoomAssignmentData $data): HotelRoom;

    public function delete(HotelRoom $room): void;
}
