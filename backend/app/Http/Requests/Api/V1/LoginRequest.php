<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Primer paso del inicio de sesión: credenciales.
 */
final class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email', 'max:150'],
            'password' => ['required', 'string', 'max:200'],
            // Nombre con el que quedará registrado el token; permite ver y
            // revocar sesiones por dispositivo.
            'device_name' => ['nullable', 'string', 'max:80'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required' => 'Indique su correo electrónico.',
            'email.email' => 'El correo electrónico no tiene un formato válido.',
            'password.required' => 'Indique su contraseña.',
        ];
    }

    public function deviceName(): string
    {
        $name = $this->validated('device_name');

        return is_string($name) && $name !== '' ? $name : 'Navegador';
    }
}
