<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use App\Domain\Hotel\Data\RoomAssignmentData;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validación de la asignación de habitaciones a un hotel.
 *
 * Se comprueba aquí que el tipo y la acomodación existan en el catálogo, y que
 * la cantidad sea un entero positivo. Deliberadamente NO se comprueba aquí que
 * la acomodación corresponda al tipo, ni que la combinación no esté repetida,
 * ni que quepa en el máximo del hotel: esas tres son reglas del dominio y
 * viven en `RoomAssignmentService`.
 *
 * La distinción importa. Si se implementaran en este `FormRequest`, sólo
 * podrían aplicarse a peticiones HTTP: una carga masiva por consola o un
 * proceso en cola las eludiría por completo.
 */
final class AssignRoomRequest extends FormRequest
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
            'room_type_id' => ['required', 'integer', Rule::exists('room_types', 'id')],
            'accommodation_id' => ['required', 'integer', Rule::exists('accommodations', 'id')],
            'quantity' => ['required', 'integer', 'min:1', 'max:10000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'room_type_id.required' => 'Debe seleccionar el tipo de habitación.',
            'room_type_id.exists' => 'El tipo de habitación seleccionado no existe en el catálogo.',
            'accommodation_id.required' => 'Debe seleccionar la acomodación.',
            'accommodation_id.exists' => 'La acomodación seleccionada no existe en el catálogo.',
            'quantity.required' => 'Debe indicar la cantidad de habitaciones.',
            'quantity.min' => 'La cantidad de habitaciones debe ser al menos 1.',
            'quantity.max' => 'La cantidad de habitaciones no puede superar 10.000.',
        ];
    }

    public function toData(): RoomAssignmentData
    {
        return RoomAssignmentData::fromArray($this->validated());
    }
}
