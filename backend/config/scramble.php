<?php

declare(strict_types=1);

use Dedoc\Scramble\Http\Middleware\RestrictedDocsAccess;
use Dedoc\Scramble\SecurityDocumentation\MiddlewareAuthSecurityStrategy;

/*
|------------------------------------------------------------------------------
| Documentación OpenAPI
|------------------------------------------------------------------------------
|
| Scramble genera la especificación OpenAPI 3.1 analizando el código: rutas,
| FormRequests, Resources y anotaciones de los controladores. No hay un archivo
| YAML que mantener a mano, así que la documentación no puede quedarse
| desactualizada respecto a lo que la API hace realmente.
|
|   /docs/api        Referencia interactiva, con consola para probar endpoints.
|   /docs/api.json   Especificación descargable, importable en Postman o Insomnia.
|
*/

return [

    // Sólo se documentan las rutas bajo este prefijo.
    'api_path' => 'api',

    'api_domain' => null,

    'export_path' => 'api.json',

    'cache' => [
        'key' => 'scramble.openapi',
        'store' => 'file',
    ],

    'info' => [
        'version' => env('API_VERSION', '1.0.0'),

        'description' => <<<'MD'
API REST del sistema de gestión hotelera de **Decameron Colombia**.

Administra el inventario de hoteles y la configuración de habitaciones de cada
uno, haciendo cumplir las reglas del negocio:

- La acomodación debe corresponder al tipo de habitación.
- No pueden repetirse tipo y acomodación en un mismo hotel.
- Las habitaciones configuradas no superan el máximo del hotel.

## Autenticación

El inicio de sesión se hace en dos pasos: credenciales y código de
verificación. El token resultante se envía en la cabecera
`Authorization: Bearer <token>`.

En esta instancia de demostración los endpoints de hoteles **no exigen token**,
para que puedan evaluarse sin credenciales. El flujo de inicio de sesión está
disponible igualmente y puede probarse desde aquí con:

| Correo | Contraseña |
|---|---|
| `gerente@decameron.test` | `decameron2026` |

## Formato de las respuestas

Toda respuesta comparte la misma envoltura. Las correctas llevan
`success: true` y los datos en `data`; las de error llevan `success: false`,
un `error_code` estable y, cuando aplica, los errores por campo en `errors`.
MD,
    ],

    'ui' => [
        'title' => 'Decameron · API de Gestión Hotelera',
    ],

    'dev_tools' => [
        'enabled' => env('SCRAMBLE_DEV_TOOLS', false),
    ],

    // Scalar en lugar de Stoplight Elements: interfaz más cuidada, con búsqueda,
    // ejemplos por lenguaje y consola de pruebas integrada.
    'renderer' => 'scalar',

    'renderers' => [
        'elements' => [
            'view' => 'scramble::docs',
            'theme' => 'dark',
            'hideTryIt' => false,
            'hideSchemas' => false,
            'logo' => '',
            'tryItCredentialsPolicy' => 'include',
            'layout' => 'responsive',
            'router' => 'hash',
        ],
        'scalar' => [
            'view' => 'scramble::scalar',
            'cdn' => 'https://cdn.jsdelivr.net/npm/@scalar/api-reference',
            // Tema en línea con el panel de administración.
            'theme' => 'deepSpace',
            'darkMode' => true,
            'proxyUrl' => 'https://proxy.scalar.com',
            'showDeveloperTools' => 'never',
            'agent' => ['disabled' => true],
            'credentials' => 'include',
        ],
    ],

    'servers' => null,

    'enum_cases_description_strategy' => 'description',
    'enum_cases_names_strategy' => false,
    'flatten_deep_query_parameters' => true,

    /*
    | Acceso a la documentación.
    |
    | `RestrictedDocsAccess` consulta la puerta `viewApiDocs`, definida en
    | `AppServiceProvider`. En local siempre se permite; en otros entornos se
    | controla con `API_DOCS_PUBLIC`, activo en la instancia de demostración
    | para que quien evalúe pueda consultarla.
    */
    'middleware' => [
        'web',
        RestrictedDocsAccess::class,
    ],

    'extensions' => [],

    // Documenta el esquema de seguridad Bearer a partir del middleware
    // `auth:sanctum`: las rutas protegidas lo exigen y las públicas se marcan
    // como tales.
    'security_strategy' => MiddlewareAuthSecurityStrategy::class,
];
