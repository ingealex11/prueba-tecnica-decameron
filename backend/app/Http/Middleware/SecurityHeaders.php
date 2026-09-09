<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Añade cabeceras de seguridad a todas las respuestas.
 *
 * Son medidas de defensa en profundidad: ninguna sustituye a validar la entrada
 * y escapar la salida, pero cada una cierra una vía de abuso concreta con coste
 * prácticamente nulo.
 */
final class SecurityHeaders
{
    /**
     * Cabeceras aplicadas a cada respuesta, con el motivo de cada una.
     *
     * @var array<string, string>
     */
    private const HEADERS = [
        // Impide que el navegador adivine el tipo de contenido. Sin ella, una
        // respuesta JSON con contenido controlado por el usuario podría
        // interpretarse como HTML y ejecutarse.
        'X-Content-Type-Options' => 'nosniff',

        // La API nunca debe mostrarse dentro de un marco: evita clickjacking.
        'X-Frame-Options' => 'DENY',

        // No filtrar la URL completa al navegar hacia otro origen; las URLs de
        // la API pueden contener identificadores que no conviene divulgar.
        'Referrer-Policy' => 'strict-origin-when-cross-origin',

        // La API no necesita cámara, micrófono ni geolocalización.
        'Permissions-Policy' => 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    ];

    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        foreach (self::HEADERS as $header => $value) {
            $response->headers->set($header, $value);
        }

        // HSTS sólo tiene sentido sobre HTTPS: enviarla en desarrollo por HTTP
        // no aporta nada y puede dejar el navegador del desarrollador fijado a
        // HTTPS para localhost.
        if ($request->secure()) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains'
            );
        }

        return $response;
    }
}
