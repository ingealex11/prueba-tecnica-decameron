<?php

declare(strict_types=1);

namespace App\Exceptions;

use App\Domain\Shared\Exceptions\DomainException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Throwable;

/**
 * Traduce cualquier excepción a una respuesta JSON de formato uniforme.
 *
 * Que todos los errores compartan estructura no es un detalle cosmético: es lo
 * que permite al frontend tener un único manejador de errores en el
 * interceptor de Axios en lugar de ramificar según el tipo de fallo. La forma
 * es siempre la misma:
 *
 *     {
 *       "success":    false,
 *       "message":    "Texto legible para el usuario",
 *       "error_code": "CLAVE_ESTABLE_DEL_ERROR",
 *       "errors":     { "campo": ["motivo"] },
 *       "meta":       { ...contexto adicional... }
 *     }
 */
final class ApiExceptionHandler
{
    /**
     * Código PostgreSQL de violación de restricción única.
     *
     * @see https://www.postgresql.org/docs/current/errcodes-appendix.html
     */
    private const PG_UNIQUE_VIOLATION = '23505';

    /**
     * Registra el renderizador de excepciones de la API.
     */
    public static function register(Exceptions $exceptions): void
    {
        $exceptions->render(static function (Throwable $e, Request $request): ?JsonResponse {
            // Las peticiones que no son de API conservan el comportamiento
            // estándar de Laravel; sólo se interviene lo que consume el cliente.
            if (! $request->is('api/*')) {
                return null;
            }

            return self::toJsonResponse($e);
        });
    }

    /**
     * Convierte la excepción en la respuesta JSON que corresponda.
     */
    private static function toJsonResponse(Throwable $e): JsonResponse
    {
        return match (true) {
            // Reglas de negocio: la excepción ya sabe cómo debe responderse.
            $e instanceof DomainException => self::respond(
                status: $e->statusCode(),
                message: $e->getMessage(),
                errorCode: $e->errorCode(),
                errors: $e->errors(),
                meta: $e->context(),
            ),

            $e instanceof ValidationException => self::respond(
                status: 422,
                message: 'Los datos enviados no son válidos. Revise los campos indicados.',
                errorCode: 'VALIDATION_FAILED',
                errors: $e->errors(),
            ),

            $e instanceof ModelNotFoundException,
            $e instanceof NotFoundHttpException => self::respond(
                status: 404,
                message: 'El recurso solicitado no existe.',
                errorCode: 'NOT_FOUND',
            ),

            $e instanceof MethodNotAllowedHttpException => self::respond(
                status: 405,
                message: 'El método HTTP utilizado no está permitido para esta ruta.',
                errorCode: 'METHOD_NOT_ALLOWED',
            ),

            $e instanceof AuthenticationException => self::respond(
                status: 401,
                message: 'Se requiere autenticación para realizar esta operación.',
                errorCode: 'UNAUTHENTICATED',
            ),

            $e instanceof AuthorizationException => self::respond(
                status: 403,
                message: 'No tiene permisos para realizar esta operación.',
                errorCode: 'FORBIDDEN',
            ),

            $e instanceof TooManyRequestsHttpException => self::respond(
                status: 429,
                message: 'Ha realizado demasiadas peticiones. Intente de nuevo en unos momentos.',
                errorCode: 'TOO_MANY_REQUESTS',
            ),

            // Última red de seguridad de las restricciones UNIQUE: si dos altas
            // simultáneas del mismo hotel superan la validación de la
            // aplicación, la base de datos rechaza una de las dos y aquí se
            // traduce a un conflicto legible en lugar de a un error 500.
            $e instanceof QueryException && self::isUniqueViolation($e) => self::respond(
                status: 409,
                message: 'El registro ya existe. Verifique que el nombre o el NIT no estén repetidos.',
                errorCode: 'DUPLICATE_RESOURCE',
            ),

            default => self::respondUnexpected($e),
        };
    }

    /**
     * Determina si el fallo de base de datos es una violación de unicidad.
     */
    private static function isUniqueViolation(QueryException $e): bool
    {
        return ($e->errorInfo[0] ?? null) === self::PG_UNIQUE_VIOLATION;
    }

    /**
     * Responde a un fallo no previsto.
     *
     * En producción se omite deliberadamente todo detalle interno: el mensaje de
     * una excepción puede contener rutas del servidor, fragmentos de SQL o
     * valores de configuración. En desarrollo sí se incluye, porque ahí el
     * destinatario es quien está depurando.
     */
    private static function respondUnexpected(Throwable $e): JsonResponse
    {
        $isDebug = (bool) config('app.debug');

        return self::respond(
            status: 500,
            message: $isDebug
                ? $e->getMessage()
                : 'Ocurrió un error inesperado. El equipo técnico ha sido notificado.',
            errorCode: 'INTERNAL_SERVER_ERROR',
            meta: $isDebug ? [
                'exception' => $e::class,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ] : [],
        );
    }

    /**
     * Construye la respuesta con el formato uniforme de la API.
     *
     * Las claves vacías se omiten para no obligar al cliente a distinguir entre
     * "sin errores de campo" y "campo errors ausente".
     *
     * @param  array<string, list<string>>  $errors
     * @param  array<string, mixed>  $meta
     */
    private static function respond(
        int $status,
        string $message,
        string $errorCode,
        array $errors = [],
        array $meta = [],
    ): JsonResponse {
        $payload = [
            'success' => false,
            'message' => $message,
            'error_code' => $errorCode,
        ];

        if ($errors !== []) {
            $payload['errors'] = $errors;
        }

        if ($meta !== []) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload, $status);
    }
}
