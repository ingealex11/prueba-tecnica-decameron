<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Domain\Hotel\Services\HotelServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ListHotelsRequest;
use App\Http\Requests\Api\V1\StoreHotelRequest;
use App\Http\Requests\Api\V1\UpdateHotelRequest;
use App\Http\Resources\Api\V1\HotelResource;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;

/**
 * Endpoints REST de gestión de hoteles.
 *
 * El controlador es deliberadamente delgado: recibe una petición ya validada,
 * la traduce a un DTO, delega en el servicio y envuelve el resultado en un
 * Resource. No contiene ni una regla de negocio.
 *
 * Ninguna acción captura excepciones. Las de dominio suben hasta
 * `ApiExceptionHandler`, que ya sabe traducirlas al código HTTP correcto;
 * capturarlas aquí duplicaría esa lógica en cada método.
 *
 * @tags Hoteles
 */
final class HotelController extends Controller
{
    public function __construct(
        private readonly HotelServiceInterface $hotels,
    ) {}

    /**
     * GET /api/v1/hotels
     *
     * Lista los hoteles con búsqueda, filtro por ciudad, ordenamiento y
     * paginación.
     */
    public function index(ListHotelsRequest $request): JsonResponse
    {
        $hotels = $this->hotels->paginate($request->toData());

        return ApiResponse::collection(
            HotelResource::collection($hotels)
        );
    }

    /**
     * POST /api/v1/hotels
     *
     * Registra un hotel nuevo. Responde 201 con la representación creada.
     */
    public function store(StoreHotelRequest $request): JsonResponse
    {
        $hotel = $this->hotels->create($request->toData());

        return ApiResponse::item(
            resource: new HotelResource($hotel),
            message: 'Hotel registrado correctamente.',
            status: 201,
        );
    }

    /**
     * GET /api/v1/hotels/{hotel}
     *
     * Devuelve un hotel con sus configuraciones de habitación.
     */
    public function show(int $hotel): JsonResponse
    {
        return ApiResponse::item(
            new HotelResource($this->hotels->findOrFail($hotel))
        );
    }

    /**
     * PUT /api/v1/hotels/{hotel}
     *
     * Actualiza los datos de un hotel.
     */
    public function update(UpdateHotelRequest $request, int $hotel): JsonResponse
    {
        $updated = $this->hotels->update($hotel, $request->toData());

        return ApiResponse::item(
            resource: new HotelResource($updated),
            message: 'Hotel actualizado correctamente.',
        );
    }

    /**
     * DELETE /api/v1/hotels/{hotel}
     *
     * Da de baja un hotel. Responde 204 sin cuerpo.
     */
    public function destroy(int $hotel): JsonResponse
    {
        $this->hotels->delete($hotel);

        return ApiResponse::noContent();
    }
}
