<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Representación pública de un hotel.
 *
 * El Resource actúa como frontera de salida: la API expone lo que esta clase
 * declara y nada más. Devolver el modelo directamente ataría el contrato
 * público al esquema de la tabla, de modo que renombrar una columna rompería a
 * todos los clientes, y cualquier columna nueva quedaría expuesta sin que nadie
 * lo decidiera.
 *
 * @mixin Hotel
 */
final class HotelResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'address' => $this->address,
            'nit' => $this->nit,
            'max_rooms' => $this->max_rooms,

            // Coordenadas agrupadas: el cliente comprueba un solo valor nulo
            // para saber si puede dibujar el hotel en el mapa.
            'location' => $this->hasCoordinates()
                ? ['latitude' => $this->latitude, 'longitude' => $this->longitude]
                : null,

            // Se calculan en el servidor y se envían ya resueltos: si los
            // calculara el cliente, cada frontend tendría que reimplementar la
            // misma resta y podrían discrepar.
            'occupied_rooms' => $this->occupiedRooms(),
            'available_rooms' => $this->availableRooms(),

            // `whenLoaded` evita disparar una consulta si la relación no se
            // cargó: es la defensa contra el problema N+1 en la serialización.
            'city' => new CityResource($this->whenLoaded('city')),
            'rooms' => HotelRoomResource::collection($this->whenLoaded('rooms')),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
