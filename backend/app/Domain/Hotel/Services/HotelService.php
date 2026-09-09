<?php

declare(strict_types=1);

namespace App\Domain\Hotel\Services;

use App\Domain\Hotel\Data\HotelData;
use App\Domain\Hotel\Data\HotelFilterData;
use App\Domain\Hotel\Repositories\HotelRepositoryInterface;
use App\Domain\Shared\Exceptions\ResourceNotFoundException;
use App\Models\Hotel;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Casos de uso de gestión de hoteles.
 *
 * Concentra la lógica de negocio del alta, consulta, edición y baja. El
 * controlador se limita a traducir HTTP y esta clase decide; ninguna regla vive
 * en la capa de transporte.
 */
final readonly class HotelService implements HotelServiceInterface
{
    public function __construct(
        private HotelRepositoryInterface $hotels,
        private RoomCapacityValidator $capacity,
    ) {}

    /**
     * @return LengthAwarePaginator<int, Hotel>
     */
    public function paginate(HotelFilterData $filters): LengthAwarePaginator
    {
        return $this->hotels->paginate($filters);
    }

    /**
     * Recupera un hotel con sus habitaciones.
     *
     * @throws ResourceNotFoundException si no existe o fue eliminado.
     */
    public function findOrFail(int $id): Hotel
    {
        return $this->hotels->findWithRooms($id)
            ?? throw ResourceNotFoundException::hotel($id);
    }

    /**
     * Registra un hotel nuevo.
     *
     * La unicidad de nombre y NIT ya la comprobó el `FormRequest`; la
     * restricción UNIQUE de la base de datos actúa como red de seguridad ante
     * dos altas simultáneas del mismo hotel, caso en el que una de las dos
     * transacciones fallará y se traducirá en un 409.
     */
    public function create(HotelData $data): Hotel
    {
        return $this->hotels->create($data);
    }

    /**
     * Actualiza un hotel existente.
     *
     * Se ejecuta en una transacción con la fila bloqueada porque la validación
     * del máximo de habitaciones lee el total configurado: sin el bloqueo, una
     * asignación de habitaciones simultánea podría colarse entre la
     * comprobación y la escritura y dejar el hotel por encima de su tope.
     *
     * @throws ResourceNotFoundException
     * @throws \App\Domain\Hotel\Exceptions\MaxRoomsBelowConfiguredException
     */
    public function update(int $id, HotelData $data): Hotel
    {
        return DB::transaction(function () use ($id, $data): Hotel {
            $hotel = $this->hotels->findForUpdate($id)
                ?? throw ResourceNotFoundException::hotel($id);

            $this->capacity->assertMaxRoomsNotBelowConfigured($hotel, $data->maxRooms);

            return $this->hotels->update($hotel, $data);
        });
    }

    /**
     * Da de baja un hotel.
     *
     * El borrado es lógico, de modo que el registro histórico se conserva. Sus
     * configuraciones de habitación se eliminan en cascada por la definición de
     * la clave foránea.
     *
     * @throws ResourceNotFoundException
     */
    public function delete(int $id): void
    {
        $hotel = $this->hotels->findById($id)
            ?? throw ResourceNotFoundException::hotel($id);

        $this->hotels->delete($hotel);
    }
}
