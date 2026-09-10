<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Domain\Hotel\Services\RoomAssignmentServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\AssignRoomRequest;
use App\Http\Resources\Api\V1\HotelRoomResource;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;

/**
 * Endpoints REST de configuración de habitaciones de un hotel.
 *
 * Las rutas están anidadas bajo el hotel (`/hotels/{hotel}/rooms/{room}`)
 * porque una configuración de habitación no tiene existencia propia fuera de su
 * hotel. El identificador del hotel no es decorativo: el servicio comprueba que
 * la configuración pertenezca efectivamente a ese hotel antes de tocarla.
 *
 * @tags Habitaciones
 */
final class HotelRoomController extends Controller
{
    public function __construct(
        private readonly RoomAssignmentServiceInterface $rooms,
    ) {}

    /**
     * GET /api/v1/hotels/{hotel}/rooms
     */
    public function index(int $hotel): JsonResponse
    {
        return ApiResponse::collection(
            HotelRoomResource::collection(
                $this->rooms->listForHotel($hotel)
            )
        );
    }

    /**
     * POST /api/v1/hotels/{hotel}/rooms
     *
     * Asigna una configuración de habitaciones al hotel.
     *
     * Puede responder 422 si la acomodación no corresponde al tipo o si se
     * supera el máximo de habitaciones, y 409 si la combinación ya existe.
     */
    public function store(AssignRoomRequest $request, int $hotel): JsonResponse
    {
        $room = $this->rooms->assign($hotel, $request->toData());

        return ApiResponse::item(
            resource: new HotelRoomResource($room),
            message: 'Habitaciones asignadas correctamente.',
            status: 201,
        );
    }

    /**
     * PUT /api/v1/hotels/{hotel}/rooms/{room}
     */
    public function update(AssignRoomRequest $request, int $hotel, int $room): JsonResponse
    {
        $updated = $this->rooms->update($hotel, $room, $request->toData());

        return ApiResponse::item(
            resource: new HotelRoomResource($updated),
            message: 'Configuración de habitaciones actualizada correctamente.',
        );
    }

    /**
     * DELETE /api/v1/hotels/{hotel}/rooms/{room}
     */
    public function destroy(int $hotel, int $room): JsonResponse
    {
        $this->rooms->remove($hotel, $room);

        return ApiResponse::noContent();
    }
}
