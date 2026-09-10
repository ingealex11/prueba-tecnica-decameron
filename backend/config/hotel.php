<?php

declare(strict_types=1);

use App\Domain\Hotel\Rules\JuniorRoomRule;
use App\Domain\Hotel\Rules\StandardRoomRule;
use App\Domain\Hotel\Rules\SuiteRoomRule;

return [

    /*
    |---------------------------------------------------------------------------
    | Reglas de acomodación
    |---------------------------------------------------------------------------
    |
    | Implementaciones de AccommodationRule que el dominio tiene registradas.
    | Son la fuente de verdad de la regla del enunciado sobre qué acomodación
    | admite cada tipo de habitación, y de ellas deriva el seeder la tabla de
    | catálogo `room_type_accommodation`.
    |
    | Para incorporar un tipo de habitación nuevo basta con crear su clase de
    | regla y añadirla a esta lista: ningún archivo existente se modifica, que
    | es exactamente lo que persigue el principio Abierto/Cerrado.
    |
    */

    'accommodation_rules' => [
        StandardRoomRule::class,
        JuniorRoomRule::class,
        SuiteRoomRule::class,
    ],

    /*
    |---------------------------------------------------------------------------
    | Autenticación de la API
    |---------------------------------------------------------------------------
    |
    | Cuando está activa, los endpoints de escritura exigen un token personal de
    | Sanctum; la lectura permanece pública. Se entrega desactivada para que la
    | aplicación desplegada pueda evaluarse sin credenciales, y se activa con
    | una variable de entorno en un despliegue real.
    |
    */

    'auth_enabled' => (bool) env('API_AUTH_ENABLED', false),

    /*
    |---------------------------------------------------------------------------
    | Segundo factor de autenticación
    |---------------------------------------------------------------------------
    |
    | `reveal_code` controla el canal de entrega del código. Activo, el código
    | se devuelve en la respuesta del inicio de sesión para que la aplicación
    | pueda mostrarlo: es el modo demostración, pensado para evaluar sin
    | depender de una bandeja de correo. En producción debe desactivarse y el
    | código enviarse por SMS o correo.
    |
    | La verificación del código es idéntica en ambos modos.
    |
    */

    'two_factor' => [
        'reveal_code' => (bool) env('TWO_FACTOR_REVEAL_CODE', true),
    ],

    /*
    |---------------------------------------------------------------------------
    | Documentación pública de la API
    |---------------------------------------------------------------------------
    |
    | Permite consultar /docs/api fuera del entorno local. Se activa en la
    | instancia de demostración y debe desactivarse en un despliegue real.
    |
    */

    'docs_public' => (bool) env('API_DOCS_PUBLIC', false),

    /*
    |---------------------------------------------------------------------------
    | Límite de peticiones
    |---------------------------------------------------------------------------
    |
    | Peticiones por minuto y por dirección IP. Protege la API frente a abuso y
    | frente a scripts mal configurados que la consulten en bucle.
    |
    */

    'rate_limit' => [
        'read' => (int) env('API_RATE_LIMIT_READ', 120),
        'write' => (int) env('API_RATE_LIMIT_WRITE', 40),
    ],

];
