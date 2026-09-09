<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent;

use App\Domain\Hotel\Data\HotelData;
use App\Domain\Hotel\Data\HotelFilterData;
use App\Domain\Hotel\Repositories\HotelRepositoryInterface;
use App\Models\Hotel;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Implementación con Eloquent del repositorio de hoteles.
 *
 * Toda dependencia del ORM queda confinada en esta clase. Es el único punto del
 * sistema que sabe que los hoteles viven en PostgreSQL y que se acceden con
 * Eloquent; el resto del código conoce únicamente la interfaz.
 */
final class EloquentHotelRepository implements HotelRepositoryInterface
{
    /**
     * @return LengthAwarePaginator<int, Hotel>
     */
    public function paginate(HotelFilterData $filters): LengthAwarePaginator
    {
        return Hotel::query()
            // `with` evita el problema N+1 al mostrar la ciudad de cada hotel;
            // `withSum` calcula las habitaciones ocupadas en la misma consulta
            // en lugar de una consulta por hotel.
            ->with('city')
            ->withSum('rooms', 'quantity')
            ->search($filters->search)
            ->inCity($filters->cityId)
            ->orderBy($filters->sortBy, $filters->sortDirection)
            // Desempate estable: sin un segundo criterio, dos hoteles con el
            // mismo nombre podrían alternar de página entre peticiones.
            ->orderBy('id')
            ->paginate($filters->perPage)
            ->withQueryString();
    }

    public function findById(int $id): ?Hotel
    {
        return Hotel::query()
            ->with('city')
            ->withSum('rooms', 'quantity')
            ->find($id);
    }

    public function findWithRooms(int $id): ?Hotel
    {
        return Hotel::query()
            ->with([
                'city',
                'rooms' => fn ($query) => $query->with(['roomType', 'accommodation'])
                    ->join('room_types', 'room_types.id', '=', 'hotel_rooms.room_type_id')
                    ->orderBy('room_types.sort_order')
                    ->select('hotel_rooms.*'),
            ])
            ->withSum('rooms', 'quantity')
            ->find($id);
    }

    public function findForUpdate(int $id): ?Hotel
    {
        // `lockForUpdate` emite SELECT ... FOR UPDATE: bloquea la fila del hotel
        // hasta que la transacción termine, de modo que dos asignaciones
        // simultáneas se serializan y no pueden superar juntas el máximo.
        return Hotel::query()
            ->lockForUpdate()
            ->find($id);
    }

    public function create(HotelData $data): Hotel
    {
        $hotel = Hotel::query()->create($data->toArray());

        return $hotel->load('city');
    }

    public function update(Hotel $hotel, HotelData $data): Hotel
    {
        $hotel->update($data->toArray());

        return $hotel->fresh(['city']) ?? $hotel;
    }

    public function delete(Hotel $hotel): void
    {
        $hotel->delete();
    }

    public function existsByName(string $name, ?int $exceptId = null): bool
    {
        return Hotel::query()
            ->where('name', $name)
            ->when($exceptId !== null, fn ($query) => $query->whereKeyNot($exceptId))
            ->exists();
    }

    public function existsByNit(string $nit, ?int $exceptId = null): bool
    {
        return Hotel::query()
            ->where('nit', $nit)
            ->when($exceptId !== null, fn ($query) => $query->whereKeyNot($exceptId))
            ->exists();
    }
}
