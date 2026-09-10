<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Segundo paso del inicio de sesión: el código de verificación.
 */
final class VerifyTwoFactorRequest extends FormRequest
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
            'challenge_id' => ['required', 'string', 'uuid'],
            // Exactamente seis dígitos: cualquier otra cosa se rechaza antes de
            // llegar a comparar, y así no consume un intento del desafío.
            'code' => ['required', 'string', 'regex:/^\d{6}$/'],
            'device_name' => ['nullable', 'string', 'max:80'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'challenge_id.required' => 'Falta el identificador de la verificación. Inicie sesión de nuevo.',
            'challenge_id.uuid' => 'El identificador de la verificación no es válido.',
            'code.required' => 'Indique el código de verificación.',
            'code.regex' => 'El código debe tener exactamente seis dígitos.',
        ];
    }

    public function deviceName(): string
    {
        $name = $this->validated('device_name');

        return is_string($name) && $name !== '' ? $name : 'Navegador';
    }
}
