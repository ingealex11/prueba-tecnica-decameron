<?php

declare(strict_types=1);

namespace App\Domain\Hotel\Repositories;

use App\Models\Accommodation;
use App\Models\City;
use App\Models\RoomType;
use Illuminate\Database\Eloquent\Collection;

/**
 * Contrato de lectura de los catálogos del sistema.
 *
 * El enunciado precisa que «no se requieren administradores para datos
 * catálogos, como ciudades, tipos de habitación o acomodación», de modo que
 * esta interfaz expone deliberadamente sólo operaciones de lectura. No es una
 * omisión: es la regla de negocio codificada en el contrato, y hace imposible
 * que un caso de uso futuro escriba en los catálogos por descuido.
 */
interface CatalogRepositoryInterface
{
    /**
     * Ciudades disponibles, en orden alfabético.
     *
     * @return Collection<int, City>
     */
    public function cities(): Collection;

    /**
     * Tipos de habitación con sus acomodaciones permitidas ya cargadas.
     *
     * @return Collection<int, RoomType>
     */
    public function roomTypesWithAccommodations(): Collection;

    /**
     * Todas las acomodaciones del catálogo.
     *
     * @return Collection<int, Accommodation>
     */
    public function accommodations(): Collection;

    public function findRoomType(int $id): ?RoomType;

    public function findAccommodation(int $id): ?Accommodation;
}
