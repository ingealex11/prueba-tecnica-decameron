<?php

declare(strict_types=1);

namespace App\Domain\Hotel\Services;

use App\Domain\Hotel\Exceptions\MaxRoomsBelowConfiguredException;
use App\Domain\Hotel\Exceptions\RoomCapacityExceededException;
use App\Domain\Hotel\Repositories\RoomRepositoryInterface;
use App\Models\Hotel;

/**
 * Hace cumplir el criterio «la cantidad de habitaciones configuradas no debe
 * superar el máximo por hotel».
 *
 * Es una clase propia y no un método dentro del servicio de asignación por
 * Responsabilidad Única: la regla se aplica desde dos casos de uso distintos
 * —asignar o editar habitaciones, y editar el máximo del hotel— y tenerla
 * aislada permite probarla sin montar ninguno de los dos.
 *
 * Importante: estos métodos asumen que quien los llama ya abrió una transacción
 * y bloqueó la fila del hotel. Sin ese bloqueo la comprobación seguiría siendo
 * correcta de forma aislada pero sería vulnerable a condiciones de carrera,
 * porque entre la lectura del total y la escritura podría colarse otra
 * petición.
 */
final readonly class RoomCapacityValidator
{
    public function __construct(
        private RoomRepositoryInterface $rooms,
    ) {}

    /**
     * Verifica que añadir o modificar una configuración no supere el máximo.
     *
     * @param  Hotel  $hotel  Hotel afectado, con su fila ya bloqueada.
     * @param  int  $quantity  Cantidad que se quiere dejar registrada.
     * @param  int|null  $exceptRoomId  Configuración que se está editando; su
     *                                  cantidad actual no cuenta contra el
     *                                  total, porque va a ser reemplazada.
     *
     * @throws RoomCapacityExceededException
     */
    public function assertFits(Hotel $hotel, int $quantity, ?int $exceptRoomId = null): void
    {
        $occupied = $this->rooms->sumQuantities($hotel->id, $exceptRoomId);

        if ($occupied + $quantity <= $hotel->max_rooms) {
            return;
        }

        throw new RoomCapacityExceededException(
            hotelName: $hotel->name,
            maxRooms: $hotel->max_rooms,
            occupiedRooms: $occupied,
            requestedQuantity: $quantity,
        );
    }

    /**
     * Verifica que un nuevo máximo no quede por debajo de lo ya configurado.
     *
     * Sin esta comprobación, editar un hotel para reducir su máximo dejaría al
     * sistema en un estado que viola su propia regla de capacidad.
     *
     * @throws MaxRoomsBelowConfiguredException
     */
    public function assertMaxRoomsNotBelowConfigured(Hotel $hotel, int $newMaxRooms): void
    {
        $occupied = $this->rooms->sumQuantities($hotel->id);

        if ($newMaxRooms >= $occupied) {
            return;
        }

        throw new MaxRoomsBelowConfiguredException(
            hotelName: $hotel->name,
            requestedMax: $newMaxRooms,
            occupiedRooms: $occupied,
        );
    }
}
