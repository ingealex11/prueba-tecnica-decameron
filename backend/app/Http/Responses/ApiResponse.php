<?php

declare(strict_types=1);

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Pagination\AbstractPaginator;

/**
 * Constructor de las respuestas correctas de la API.
 *
 * Es el espejo de `ApiExceptionHandler`: entre las dos garantizan que toda
 * respuesta de la API, tenga éxito o falle, comparta la misma envoltura:
 *
 *     {
 *       "success": true,
 *       "message": "...",
 *       "data":    { ... },
 *       "meta":    { ...paginación... }
 *     }
 *
 * Un cliente puede así comprobar `success` una sola vez, en un interceptor, en
 * lugar de inspeccionar la forma de cada respuesta.
 */
final class ApiResponse
{
    /**
     * Respuesta con un único recurso.
     *
     * @param  array<string, mixed>  $meta
     */
    public static function item(
        JsonResource $resource,
        string $message = '',
        int $status = 200,
        array $meta = [],
    ): JsonResponse {
        return self::build(
            data: $resource,
            message: $message,
            status: $status,
            meta: $meta,
        );
    }

    /**
     * Respuesta con una colección, paginada o no.
     *
     * Cuando el recurso envuelve un paginador, los metadatos de paginación se
     * extraen a `meta` en lugar de mezclarse con los datos: así el cliente
     * recibe siempre un array plano en `data`, pagine o no.
     */
    public static function collection(
        ResourceCollection $collection,
        string $message = '',
        int $status = 200,
    ): JsonResponse {
        $meta = [];
        $underlying = $collection->resource;

        if ($underlying instanceof AbstractPaginator) {
            $meta['pagination'] = [
                'current_page' => $underlying->currentPage(),
                'per_page' => $underlying->perPage(),
                'total' => method_exists($underlying, 'total') ? $underlying->total() : null,
                'last_page' => method_exists($underlying, 'lastPage') ? $underlying->lastPage() : null,
                'from' => $underlying->firstItem(),
                'to' => $underlying->lastItem(),
            ];
        }

        return self::build(
            data: $collection,
            message: $message,
            status: $status,
            meta: $meta,
        );
    }

    /**
     * Respuesta sin cuerpo, para operaciones que no devuelven representación.
     *
     * Se usa 204 en las eliminaciones: la operación tuvo éxito y no hay nada
     * que devolver. Enviar un 200 con un objeto vacío obligaría al cliente a
     * interpretar un cuerpo que no aporta información.
     */
    public static function noContent(): JsonResponse
    {
        return response()->json(null, 204);
    }

    /**
     * Ensambla la envoltura común.
     *
     * @param  array<string, mixed>  $meta
     */
    private static function build(
        JsonResource $data,
        string $message,
        int $status,
        array $meta,
    ): JsonResponse {
        $payload = ['success' => true];

        if ($message !== '') {
            $payload['message'] = $message;
        }

        $payload['data'] = $data;

        if ($meta !== []) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload, $status);
    }
}
