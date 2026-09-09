<?php

declare(strict_types=1);

namespace App\Domain\Hotel\Services;

use App\Domain\Hotel\Data\RoomAssignmentData;
use App\Domain\Hotel\Exceptions\DuplicateRoomConfigurationException;
use App\Domain\Hotel\Exceptions\InvalidAccommodationException;
use App\Domain\Hotel\Exceptions\RoomCapacityExceededException;
use App\Domain\Hotel\Repositories\CatalogRepositoryInterface;
use App\Domain\Hotel\Repositories\HotelRepositoryInterface;
use App\Domain\Hotel\Repositories\RoomRepositoryInterface;
use App\Domain\Hotel\Rules\AccommodationRuleResolver;
use App\Domain\Shared\Exceptions\ResourceNotFoundException;
use App\Models\Accommodation;
use App\Models\Hotel;
use App\Models\HotelRoom;
use App\Models\RoomType;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Casos de uso de configuración de habitaciones de un hotel.
 *
 * Es el punto donde convergen las tres reglas del enunciado, y por eso el más
 * cuidado del sistema:
 *
 *   1. La acomodación debe corresponder al tipo de habitación.
 *   2. La combinación tipo + acomodación no puede repetirse en el mismo hotel.
 *   3. La suma de habitaciones no puede superar el máximo del hotel.
 *
 * Las tres se verifican dentro de una única transacción con la fila del hotel
 * bloqueada. El orden no es casual: se comprueba primero lo que se resuelve sin
 * consultar la base de datos y por último lo que exige un agregado, de modo que
 * una petición inválida se rechaza con el menor trabajo posible.
 */
final readonly class RoomAssignmentService implements RoomAssignmentServiceInterface
{
    public function __construct(
        private HotelRepositoryInterface $hotels,
        private RoomRepositoryInterface $rooms,
        private CatalogRepositoryInterface $catalog,
        private AccommodationRuleResolver $ruleResolver,
        private RoomCapacityValidator $capacity,
    ) {}

    /**
     * Configuraciones de habitación de un hotel.
     *
     * @return Collection<int, HotelRoom>
     *
     * @throws ResourceNotFoundException si el hotel no existe.
     */
    public function listForHotel(int $hotelId): Collection
    {
        $this->hotels->findById($hotelId)
            ?? throw ResourceNotFoundException::hotel($hotelId);

        return $this->rooms->forHotel($hotelId);
    }

    /**
     * Asigna una configuración de habitaciones nueva a un hotel.
     *
     * @throws ResourceNotFoundException
     * @throws InvalidAccommodationException
     * @throws DuplicateRoomConfigurationException
     * @throws RoomCapacityExceededException
     */
    public function assign(int $hotelId, RoomAssignmentData $data): HotelRoom
    {
        return DB::transaction(function () use ($hotelId, $data): HotelRoom {
            $hotel = $this->lockHotel($hotelId);
            [$roomType, $accommodation] = $this->resolveCatalog($data);

            $this->guardAgainstInvalidConfiguration($hotel, $roomType, $accommodation, $data);
            $this->capacity->assertFits($hotel, $data->quantity);

            return $this->rooms->create($hotelId, $data);
        });
    }

    /**
     * Modifica una configuración existente.
     *
     * La configuración que se edita se excluye de las comprobaciones de
     * duplicidad y de capacidad: de lo contrario se detectaría a sí misma como
     * repetida, y su cantidad actual contaría dos veces contra el máximo,
     * haciendo imposible cualquier aumento.
     *
     * @throws ResourceNotFoundException
     * @throws InvalidAccommodationException
     * @throws DuplicateRoomConfigurationException
     * @throws RoomCapacityExceededException
     */
    public function update(int $hotelId, int $roomId, RoomAssignmentData $data): HotelRoom
    {
        return DB::transaction(function () use ($hotelId, $roomId, $data): HotelRoom {
            $hotel = $this->lockHotel($hotelId);
            $room = $this->findRoomOfHotel($hotelId, $roomId);
            [$roomType, $accommodation] = $this->resolveCatalog($data);

            $this->guardAgainstInvalidConfiguration($hotel, $roomType, $accommodation, $data, $room->id);
            $this->capacity->assertFits($hotel, $data->quantity, $room->id);

            return $this->rooms->update($room, $data);
        });
    }

    /**
     * Elimina una configuración, liberando su cupo de habitaciones.
     *
     * @throws ResourceNotFoundException
     */
    public function remove(int $hotelId, int $roomId): void
    {
        DB::transaction(function () use ($hotelId, $roomId): void {
            $this->lockHotel($hotelId);

            $this->rooms->delete(
                $this->findRoomOfHotel($hotelId, $roomId)
            );
        });
    }

    /**
     * Recupera el hotel bloqueando su fila hasta el fin de la transacción.
     *
     * @throws ResourceNotFoundException
     */
    private function lockHotel(int $hotelId): Hotel
    {
        return $this->hotels->findForUpdate($hotelId)
            ?? throw ResourceNotFoundException::hotel($hotelId);
    }

    /**
     * Recupera una configuración comprobando que pertenezca al hotel indicado.
     *
     * La comprobación de pertenencia importa: sin ella, `DELETE
     * /hotels/1/rooms/99` borraría la configuración 99 aunque fuese del hotel 2.
     * Es el patrón de rutas anidadas mal implementado, y una vía habitual de
     * referencia directa insegura a objetos.
     *
     * @throws ResourceNotFoundException
     */
    private function findRoomOfHotel(int $hotelId, int $roomId): HotelRoom
    {
        $room = $this->rooms->findById($roomId);

        if ($room === null || $room->hotel_id !== $hotelId) {
            throw ResourceNotFoundException::room($roomId);
        }

        return $room;
    }

    /**
     * Resuelve el tipo de habitación y la acomodación del catálogo.
     *
     * @return array{RoomType, Accommodation}
     *
     * @throws ResourceNotFoundException
     */
    private function resolveCatalog(RoomAssignmentData $data): array
    {
        $roomType = $this->catalog->findRoomType($data->roomTypeId)
            ?? throw ResourceNotFoundException::roomType($data->roomTypeId);

        $accommodation = $this->catalog->findAccommodation($data->accommodationId)
            ?? throw ResourceNotFoundException::accommodation($data->accommodationId);

        return [$roomType, $accommodation];
    }

    /**
     * Aplica las reglas de acomodación válida y de no duplicidad.
     *
     * Ambas se agrupan aquí porque las comparten `assign()` y `update()`; la
     * única diferencia entre los dos casos es qué configuración se excluye.
     *
     * @throws InvalidAccommodationException
     * @throws DuplicateRoomConfigurationException
     */
    private function guardAgainstInvalidConfiguration(
        Hotel $hotel,
        RoomType $roomType,
        Accommodation $accommodation,
        RoomAssignmentData $data,
        ?int $exceptRoomId = null,
    ): void {
        // Primero la regla que se resuelve en memoria, sin tocar la base.
        $this->ruleResolver->assertValid($roomType, $accommodation);

        $isDuplicate = $this->rooms->existsCombination(
            hotelId: $hotel->id,
            roomTypeId: $data->roomTypeId,
            accommodationId: $data->accommodationId,
            exceptRoomId: $exceptRoomId,
        );

        if ($isDuplicate) {
            throw new DuplicateRoomConfigurationException(
                hotelName: $hotel->name,
                roomTypeName: $roomType->name,
                accommodationName: $accommodation->name,
            );
        }
    }
}
