<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\Accommodation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Representación pública de una acomodación del catálogo.
 *
 * @mixin Accommodation
 */
final class AccommodationResource extends JsonResource
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
            'capacity' => $this->capacity,
        ];
    }
}
