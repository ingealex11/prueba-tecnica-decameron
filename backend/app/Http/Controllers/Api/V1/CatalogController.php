<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Domain\Hotel\Repositories\CatalogRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\AccommodationResource;
use App\Http\Resources\Api\V1\CityResource;
use App\Http\Resources\Api\V1\RoomTypeResource;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;

/**
 * Endpoints de sólo lectura de los catálogos del sistema.
 *
 * El enunciado indica que «no se requieren administradores para datos
 * catálogos, como ciudades, tipos de habitación o acomodación». Por eso este
 * controlador expone únicamente verbos GET: no hay `store`, `update` ni
 * `destroy` que un cambio futuro pueda exponer por descuido.
 *
 * Estos endpoints son los que permiten que el frontend no lleve codificada
 * ninguna regla del negocio: pregunta al servidor qué opciones existen y cuáles
 * son válidas para cada tipo.
 */
final class CatalogController extends Controller
{
    public function __construct(
        private readonly CatalogRepositoryInterface $catalog,
    ) {}

    /**
     * GET /api/v1/catalogs/cities
     */
    public function cities(): JsonResponse
    {
        return ApiResponse::collection(
            CityResource::collection($this->catalog->cities())
        );
    }

    /**
     * GET /api/v1/catalogs/room-types
     *
     * Devuelve cada tipo de habitación junto con las acomodaciones que admite.
     * Es la fuente desde la que el formulario del frontend limita las opciones
     * del selector de acomodación al elegir un tipo.
     */
    public function roomTypes(): JsonResponse
    {
        return ApiResponse::collection(
            RoomTypeResource::collection(
                $this->catalog->roomTypesWithAccommodations()
            )
        );
    }

    /**
     * GET /api/v1/catalogs/accommodations
     */
    public function accommodations(): JsonResponse
    {
        return ApiResponse::collection(
            AccommodationResource::collection($this->catalog->accommodations())
        );
    }
}
