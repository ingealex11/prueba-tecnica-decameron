<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\City;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Representación pública de una ciudad del catálogo.
 *
 * @mixin City
 */
final class CityResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'dane_code' => $this->dane_code,
        ];
    }
}
