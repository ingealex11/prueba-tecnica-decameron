<?php

declare(strict_types=1);

/*
|------------------------------------------------------------------------------
| Intercambio de recursos entre orígenes (CORS)
|------------------------------------------------------------------------------
|
| El backend y el frontend son aplicaciones independientes desplegadas en
| dominios distintos, así que el navegador trata cada llamada del frontend como
| una petición entre orígenes y exige que el servidor la autorice de forma
| explícita.
|
| La lista de orígenes se lee de una variable de entorno en lugar de dejar el
| comodín `*`. Abrir la API a cualquier dominio permitiría que un sitio de
| terceros la consumiera desde el navegador de un usuario; declararlos hace que
| el permiso sea una decisión consciente de cada despliegue.
|
*/

/** @var list<string> $allowedOrigins */
$allowedOrigins = array_values(array_filter(
    array_map('trim', explode(',', (string) env('CORS_ALLOWED_ORIGINS', ''))),
    static fn (string $origin): bool => $origin !== '',
));

/** Patrón opcional de origen, para los subdominios de vista previa. */
$originPattern = trim((string) env('CORS_ALLOWED_ORIGIN_PATTERN', ''));

return [

    // Sólo la API necesita CORS; el resto de rutas no las consume el frontend.
    'paths' => ['api/*'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    // Si no se declara ninguno se cae a los de desarrollo, para que un
    // proyecto recién clonado funcione sin configuración adicional.
    'allowed_origins' => $allowedOrigins !== []
        ? $allowedOrigins
        : ['http://localhost:5173', 'http://127.0.0.1:5173'],

    // Permite que los despliegues de vista previa de Vercel, cuyo subdominio
    // cambia en cada publicación, sigan funcionando sin reconfigurar nada.
    //
    // Se comprueba que sea una cadena no vacía: `env()` devuelve booleanos
    // cuando la variable vale "true" o "false", y un booleano aquí produciría
    // un error al intentar usarlo como expresión regular.
    'allowed_origins_patterns' => $originPattern !== '' ? [$originPattern] : [],

    'allowed_headers' => [
        'Accept',
        'Authorization',
        'Content-Type',
        'X-Requested-With',
        'X-XSRF-TOKEN',
    ],

    // Cabeceras que el navegador deja leer al JavaScript del cliente. Se
    // exponen las del límite de peticiones para que el frontend pueda avisar
    // antes de agotar la cuota.
    'exposed_headers' => [
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'Retry-After',
    ],

    // Un día de caché para la petición previa de comprobación: evita que el
    // navegador pregunte antes de cada escritura.
    'max_age' => 86400,

    // La autenticación es por token en la cabecera Authorization, no por
    // cookie, así que no hacen falta credenciales entre orígenes. Activarlo
    // obligaría además a renunciar al uso de patrones de origen.
    'supports_credentials' => false,

];
