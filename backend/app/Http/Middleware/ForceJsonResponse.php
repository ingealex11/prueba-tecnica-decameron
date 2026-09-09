<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Fuerza que la API negocie siempre contenido JSON.
 *
 * Sin esto, una petición que no envíe `Accept: application/json` —por ejemplo
 * la de un navegador al abrir un endpoint directamente— recibiría los errores
 * como HTML, incluida la página de excepción de Laravel. Además de ser
 * inservible para un cliente REST, en un entorno mal configurado esa página
 * puede revelar rutas del servidor y fragmentos de configuración.
 */
final class ForceJsonResponse
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $request->headers->set('Accept', 'application/json');

        return $next($request);
    }
}
