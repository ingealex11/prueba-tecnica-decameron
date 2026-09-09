<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use App\Domain\Hotel\Data\HotelData;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validación del alta de un hotel.
 *
 * Responde únicamente a la pregunta "¿está bien formada la petición?". Las
 * reglas que dependen del estado del dominio —como que el máximo de
 * habitaciones no quede por debajo de lo ya configurado— viven en los
 * servicios, no aquí.
 *
 * La unicidad es el caso frontera: se comprueba en ambos sitios. Aquí para
 * producir un error 422 por campo, que es lo que la interfaz necesita para
 * resaltar el input correcto; y en la base de datos como restricción UNIQUE,
 * que es lo único que resiste dos altas simultáneas.
 */
class StoreHotelRequest extends FormRequest
{
    /**
     * La autorización se resuelve en el middleware de ruta, que decide según
     * `hotel.auth_enabled` si exige token. Llegado aquí, la petición ya pasó
     * ese control.
     */
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
            'name' => [
                'required', 'string', 'min:3', 'max:150',
                Rule::unique('hotels', 'name')->whereNull('deleted_at'),
            ],
            'address' => ['required', 'string', 'min:5', 'max:200'],
            'city_id' => ['required', 'integer', Rule::exists('cities', 'id')],
            'nit' => [
                'required', 'string', 'max:20',
                // NIT colombiano: de 6 a 15 dígitos con dígito de verificación
                // opcional tras un guion. Se valida como texto porque puede
                // llevar ceros a la izquierda.
                'regex:/^\d{6,15}(-\d)?$/',
                Rule::unique('hotels', 'nit')->whereNull('deleted_at'),
            ],
            // El tope superior evita que un error de digitación cree un hotel
            // con un millón de habitaciones.
            'max_rooms' => ['required', 'integer', 'min:1', 'max:10000'],
        ];
    }

    /**
     * Mensajes en el lenguaje del negocio: quien los lee es un gerente
     * hotelero, no un desarrollador.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del hotel es obligatorio.',
            'name.unique' => 'Ya existe un hotel registrado con ese nombre.',
            'name.min' => 'El nombre del hotel debe tener al menos 3 caracteres.',
            'address.required' => 'La dirección del hotel es obligatoria.',
            'city_id.required' => 'Debe seleccionar la ciudad del hotel.',
            'city_id.exists' => 'La ciudad seleccionada no existe en el catálogo.',
            'nit.required' => 'El NIT es obligatorio.',
            'nit.unique' => 'Ya existe un hotel registrado con ese NIT.',
            'nit.regex' => 'El NIT debe contener sólo dígitos, con un dígito de verificación opcional tras un guion. Ejemplo: 12345678-9.',
            'max_rooms.required' => 'El número máximo de habitaciones es obligatorio.',
            'max_rooms.min' => 'El hotel debe tener al menos una habitación.',
            'max_rooms.max' => 'El número máximo de habitaciones no puede superar 10.000.',
        ];
    }

    /**
     * Normaliza la entrada antes de validarla.
     *
     * Sin esto, "  Decameron Cartagena  " y "Decameron Cartagena" se
     * considerarían nombres distintos y la regla de unicidad podría
     * sortearse con sólo añadir un espacio.
     */
    protected function prepareForValidation(): void
    {
        $this->merge(array_filter([
            'name' => is_string($this->input('name')) ? trim($this->input('name')) : null,
            'address' => is_string($this->input('address')) ? trim($this->input('address')) : null,
            'nit' => is_string($this->input('nit')) ? trim($this->input('nit')) : null,
        ], static fn ($value): bool => $value !== null));
    }

    /**
     * Traduce la petición validada al DTO que consume el dominio.
     */
    public function toData(): HotelData
    {
        return HotelData::fromArray($this->validated());
    }
}
