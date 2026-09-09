<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Validation\Rule;

/**
 * Validación de la edición de un hotel.
 *
 * Hereda del alta porque las reglas de forma son idénticas; lo único que
 * cambia es que las comprobaciones de unicidad deben ignorar el propio
 * registro. Sin esa exclusión, guardar un hotel sin cambiarle el nombre
 * fallaría acusándolo de duplicarse a sí mismo.
 */
final class UpdateHotelRequest extends StoreHotelRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $hotelId = (int) $this->route('hotel');

        $rules = parent::rules();

        $rules['name'] = [
            'required', 'string', 'min:3', 'max:150',
            Rule::unique('hotels', 'name')
                ->ignore($hotelId)
                ->whereNull('deleted_at'),
        ];

        $rules['nit'] = [
            'required', 'string', 'max:20',
            'regex:/^\d{6,15}(-\d)?$/',
            Rule::unique('hotels', 'nit')
                ->ignore($hotelId)
                ->whereNull('deleted_at'),
        ];

        return $rules;
    }
}
