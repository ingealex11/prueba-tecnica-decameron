<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use App\Domain\Hotel\Data\HotelFilterData;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validación de los parámetros del listado de hoteles.
 *
 * Validar los parámetros de consulta no es un formalismo. `sort_by` acaba
 * interpolado en una cláusula ORDER BY, así que restringirlo a una lista
 * cerrada de columnas es lo que impide una inyección SQL por esa vía. Y acotar
 * `per_page` evita que un cliente solicite el catálogo entero en una petición.
 */
final class ListHotelsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:150'],
            'city_id' => ['nullable', 'integer', Rule::exists('cities', 'id')],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:'.HotelFilterData::MAX_PER_PAGE],
            'sort_by' => ['nullable', 'string', Rule::in(HotelFilterData::SORTABLE)],
            'sort_direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'sort_by.in' => 'Sólo es posible ordenar por: '.implode(', ', HotelFilterData::SORTABLE).'.',
            'sort_direction.in' => 'La dirección de ordenamiento debe ser "asc" o "desc".',
            'per_page.max' => 'No es posible solicitar más de '.HotelFilterData::MAX_PER_PAGE.' registros por página.',
            'city_id.exists' => 'La ciudad indicada no existe en el catálogo.',
        ];
    }

    public function toData(): HotelFilterData
    {
        return HotelFilterData::fromArray($this->validated());
    }
}
