<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Domain\Auth\Services\AuthService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\LoginRequest;
use App\Http\Requests\Api\V1\VerifyTwoFactorRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Http\Responses\ApiResponse;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Autenticación en dos pasos.
 *
 * @tags Autenticación
 */
final class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $auth,
    ) {}

    /**
     * Iniciar sesión (paso 1 de 2)
     *
     * Verifica correo y contraseña. Si son correctos, emite un desafío de
     * segundo factor y devuelve su identificador. **No devuelve un token**:
     * la sesión sólo se abre al resolver el desafío en el paso 2.
     *
     * En modo demostración la respuesta incluye el código en `demo_code`, para
     * que pueda probarse sin bandeja de correo. En producción ese campo es nulo
     * y el código viaja por SMS o correo.
     *
     * @unauthenticated
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Credenciales correctas. Introduzca el código de verificación.",
     *   "data": {
     *     "challenge_id": "9c2f6b2e-1c8e-4b1a-9c3d-2f5e8a7b6c1d",
     *     "expires_in": 300,
     *     "sent_to": "ge•••••@decameron.test",
     *     "demo_code": "482913"
     *   }
     * }
     * @response 401 {
     *   "success": false,
     *   "message": "Las credenciales indicadas no son correctas.",
     *   "error_code": "INVALID_CREDENTIALS"
     * }
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $issued = $this->auth->beginLogin(
            email: (string) $request->validated('email'),
            password: (string) $request->validated('password'),
        );

        return response()->json([
            'success' => true,
            'message' => 'Credenciales correctas. Introduzca el código de verificación.',
            'data' => [
                'challenge_id' => $issued->challengeId,
                'expires_in' => $issued->expiresInSeconds,
                'sent_to' => $issued->maskedDestination,
                'demo_code' => $issued->demoCode,
            ],
        ]);
    }

    /**
     * Verificar el segundo factor (paso 2 de 2)
     *
     * Resuelve el desafío emitido en el paso 1. Si el código coincide, abre la
     * sesión y devuelve el token con el que autenticar el resto de peticiones
     * mediante la cabecera `Authorization: Bearer <token>`.
     *
     * Cada desafío admite cinco intentos y caduca a los cinco minutos.
     *
     * @unauthenticated
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Sesión iniciada.",
     *   "data": {
     *     "token": "1|hZq3...",
     *     "token_type": "Bearer",
     *     "user": { "id": 1, "name": "Gerente de Operaciones", "email": "gerente@decameron.test", "initials": "GO" }
     *   }
     * }
     * @response 422 {
     *   "success": false,
     *   "message": "El código no es correcto. Le quedan 4 intentos.",
     *   "error_code": "INVALID_TWO_FACTOR_CODE",
     *   "meta": { "attempts_remaining": 4 }
     * }
     */
    public function verify(VerifyTwoFactorRequest $request): JsonResponse
    {
        $session = $this->auth->completeLogin(
            challengeId: (string) $request->validated('challenge_id'),
            code: (string) $request->validated('code'),
            deviceName: $request->deviceName(),
        );

        return response()->json([
            'success' => true,
            'message' => 'Sesión iniciada.',
            'data' => [
                'token' => $session->token,
                'token_type' => 'Bearer',
                'user' => new UserResource($session->user),
            ],
        ]);
    }

    /**
     * Usuario autenticado
     *
     * Devuelve la persona a la que pertenece el token de la petición. Sirve
     * para restaurar la sesión al recargar la aplicación.
     */
    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return ApiResponse::item(new UserResource($user));
    }

    /**
     * Cerrar sesión
     *
     * Revoca el token de la petición actual. Las sesiones abiertas en otros
     * dispositivos no se ven afectadas.
     */
    public function logout(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->auth->logout($user);

        return ApiResponse::noContent();
    }
}
