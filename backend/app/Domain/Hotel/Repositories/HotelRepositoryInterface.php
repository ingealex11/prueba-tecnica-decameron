<?php

declare(strict_types=1);

namespace App\Domain\Hotel\Repositories;

use App\Domain\Hotel\Data\HotelData;
use App\Domain\Hotel\Data\HotelFilterData;
use App\Models\Hotel;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Contrato de persistencia de hoteles.
 *
 * Los servicios dependen de esta interfaz y nunca de Eloquent. Eso es el
 * principio de Inversión de Dependencias en su forma práctica: la lógica de
 * negocio define qué necesita, y la capa de infraestructura se adapta, no al
 * revés.
 *
 * Dos beneficios concretos, no teóricos:
 *
 *   1. Las pruebas unitarias de los servicios se ejecutan contra un doble de
 *      esta interfaz, sin base de datos, y por tanto en milisegundos.
 *   2. Cambiar Eloquent por consultas SQL a mano, o por otro motor, se resuelve
 *      escribiendo una implementación nueva sin tocar una línea de dominio.
 */
interface HotelRepositoryInterface
{
    /**
     * Lista hoteles paginados aplicando búsqueda, filtro y ordenamiento.
     *
     * @return LengthAwarePaginator<int, Hotel>
     */
    public function paginate(HotelFilterData $filters): LengthAwarePaginator;

    /**
     * Recupera un hotel por su identificador.
     *
     * @return Hotel|null `null` si no existe o está eliminado lógicamente.
     */
    public function findById(int $id): ?Hotel;

    /**
     * Recupera un hotel con sus habitaciones y catálogos ya cargados.
     *
     * Existe como método propio para que el caso de uso "ver detalle" no
     * provoque el problema N+1 al recorrer las configuraciones.
     */
    public function findWithRooms(int $id): ?Hotel;

    /**
     * Recupera un hotel bloqueando su fila hasta el fin de la transacción.
     *
     * Necesario para validar la capacidad sin condiciones de carrera: entre
     * leer cuántas habitaciones hay configuradas y escribir la nueva, ninguna
     * otra transacción puede insertar habitaciones en este hotel.
     *
     * Debe invocarse siempre dentro de una transacción activa.
     */
    public function findForUpdate(int $id): ?Hotel;

    public function create(HotelData $data): Hotel;

    public function update(Hotel $hotel, HotelData $data): Hotel;

    /**
     * Elimina lógicamente el hotel; sus configuraciones se eliminan en cascada.
     */
    public function delete(Hotel $hotel): void;

    /**
     * Indica si ya existe otro hotel con ese nombre.
     *
     * @param  int|null  $exceptId  Hotel a excluir de la comprobación, para que
     *                              al editar un hotel su propio nombre no se
     *                              considere duplicado.
     */
    public function existsByName(string $name, ?int $exceptId = null): bool;

    /**
     * Indica si ya existe otro hotel con ese NIT.
     *
     * @param  int|null  $exceptId  Hotel a excluir de la comprobación.
     */
    public function existsByNit(string $nit, ?int $exceptId = null): bool;
}
