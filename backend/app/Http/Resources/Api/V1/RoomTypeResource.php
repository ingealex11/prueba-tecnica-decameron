<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\RoomType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Representación pública de un tipo de habitación, con las acomodaciones que
 * admite.
 *
 * Incluir aquí las acomodaciones permitidas es lo que permite al frontend
 * ofrecer sólo opciones válidas sin duplicar la regla de negocio: el cliente no
 * decide qué combinaciones existen, las consulta.
 *
 * @mixin RoomType
 */
final class RoomTypeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'accommodations' => AccommodationResource::collection(
                $this->whenLoaded('accommodations')
            ),
        ];
    }
}
