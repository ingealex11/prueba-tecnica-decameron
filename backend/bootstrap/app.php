<?php

declare(strict_types=1);

use App\Http\Middleware\ForceJsonResponse;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // La API es exclusivamente JSON. Forzar la cabecera Accept garantiza
        // que un cliente que la omita —o un navegador que pida HTML— reciba de
        // todos modos errores en JSON y no una página de excepción.
        $middleware->api(prepend: [
            ForceJsonResponse::class,
        ]);

        // Cabeceras de seguridad en todas las respuestas.
        $middleware->append(SecurityHeaders::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // El registro de excepciones vive en su propia clase para no convertir
        // este archivo de arranque en un contenedor de lógica.
        App\Exceptions\ApiExceptionHandler::register($exceptions);
    })->create();
