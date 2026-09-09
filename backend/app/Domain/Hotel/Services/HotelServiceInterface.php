<?php

declare(strict_types=1);

namespace App\Domain\Hotel\Services;

use App\Domain\Hotel\Data\HotelData;
use App\Domain\Hotel\Data\HotelFilterData;
use App\Models\Hotel;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Casos de uso relacionados con la gestión de hoteles.
 *
 * El controlador depende de esta interfaz, no de la implementación concreta.
 * Puede parecer excesivo cuando sólo hay una implementación, pero es lo que
 * permite sustituirla en pruebas y lo que deja explícito, en un solo archivo,
 * el catálogo completo de operaciones que el sistema ofrece sobre hoteles.
 */
interface HotelServiceInterface
{
    /**
     * @return LengthAwarePaginator<int, Hotel>
     */
    public function paginate(HotelFilterData $filters): LengthAwarePaginator;

    public function findOrFail(int $id): Hotel;

    public function create(HotelData $data): Hotel;

    public function update(int $id, HotelData $data): Hotel;

    public function delete(int $id): void;
}
