<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\HotelRoom;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Representación pública de una configuración de habitaciones de un hotel.
 *
 * @mixin HotelRoom
 */
final class HotelRoomResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'hotel_id' => $this->hotel_id,
            'quantity' => $this->quantity,
            'room_type' => new RoomTypeResource($this->whenLoaded('roomType')),
            'accommodation' => new AccommodationResource($this->whenLoaded('accommodation')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
