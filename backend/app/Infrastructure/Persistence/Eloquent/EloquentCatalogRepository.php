<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent;

use App\Domain\Hotel\Repositories\CatalogRepositoryInterface;
use App\Models\Accommodation;
use App\Models\City;
use App\Models\RoomType;
use Illuminate\Database\Eloquent\Collection;

/**
 * Implementación con Eloquent de la lectura de catálogos.
 *
 * Los catálogos son pequeños y prácticamente inmutables —cambian cuando la
 * compañía abre operación en una ciudad nueva—, pero se consultan en cada carga
 * de formulario. Por eso las respuestas se memorizan durante la petición: evita
 * repetir la misma consulta varias veces al construir una respuesta, sin
 * introducir la complejidad de invalidar una caché persistente.
 */
final class EloquentCatalogRepository implements CatalogRepositoryInterface
{
    /** @var array<string, mixed> Memorización acotada al ciclo de vida de la petición. */
    private array $memo = [];

    /**
     * @return Collection<int, City>
     */
    public function cities(): Collection
    {
        /** @var Collection<int, City> */
        return $this->memo['cities'] ??= City::query()
            ->orderBy('name')
            ->get();
    }

    /**
     * @return Collection<int, RoomType>
     */
    public function roomTypesWithAccommodations(): Collection
    {
        /** @var Collection<int, RoomType> */
        return $this->memo['room_types'] ??= RoomType::query()
            ->with('accommodations')
            ->orderBy('sort_order')
            ->get();
    }

    /**
     * @return Collection<int, Accommodation>
     */
    public function accommodations(): Collection
    {
        /** @var Collection<int, Accommodation> */
        return $this->memo['accommodations'] ??= Accommodation::query()
            ->orderBy('sort_order')
            ->get();
    }

    public function findRoomType(int $id): ?RoomType
    {
        // Se resuelve sobre la colección ya cargada en lugar de con una consulta
        // nueva: el catálogo completo son tres filas y ya está en memoria.
        return $this->roomTypesWithAccommodations()
            ->firstWhere('id', $id);
    }

    public function findAccommodation(int $id): ?Accommodation
    {
        return $this->accommodations()
            ->firstWhere('id', $id);
    }
}
