<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\CatalogController;
use App\Http\Controllers\Api\V1\HotelController;
use App\Http\Controllers\Api\V1\HotelRoomController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas de la API
|--------------------------------------------------------------------------
|
| La API está versionada bajo /api/v1. El versionado en la URL permite
| publicar una v2 con un contrato distinto sin romper los clientes ya
| desplegados, que siguen apuntando a v1 hasta que migren.
|
| Las rutas se agrupan por naturaleza de la operación, no por recurso:
|
|   - Lectura: pública, con un límite de peticiones holgado.
|   - Escritura: límite más estricto y, si `hotel.auth_enabled` está activo,
|     token de Sanctum obligatorio.
|
| El interruptor de autenticación existe porque el enunciado no pide login y
| la aplicación desplegada debe poder evaluarse sin credenciales, pero un
| despliegue real sí debe protegerse. Se resuelve con configuración en lugar
| de con código comentado.
|
*/

/*
| Restricción de parámetros de ruta.
|
| Sin ella, `/api/v1/hotels/abc` entraría al controlador y `(int) 'abc'` daría
| 0, produciendo un 404 confuso. Con la restricción, la ruta simplemente no
| coincide y el 404 lo emite el enrutador, que es donde corresponde.
*/
Route::pattern('hotel', '[0-9]+');
Route::pattern('room', '[0-9]+');

/** Middlewares aplicados a las operaciones de escritura. */
$writeMiddleware = ['throttle:'.config('hotel.rate_limit.write').',1'];

if (config('hotel.auth_enabled')) {
    $writeMiddleware[] = 'auth:sanctum';
}

/** Middlewares aplicados a las operaciones de lectura. */
$readMiddleware = ['throttle:'.config('hotel.rate_limit.read').',1'];

Route::prefix('v1')->group(function () use ($readMiddleware, $writeMiddleware): void {

    /*
    | Catálogos: sólo lectura, por decisión de negocio explícita.
    */
    Route::middleware($readMiddleware)
        ->prefix('catalogs')
        ->name('api.v1.catalogs.')
        ->group(function (): void {
            Route::get('cities', [CatalogController::class, 'cities'])->name('cities');
            Route::get('room-types', [CatalogController::class, 'roomTypes'])->name('room-types');
            Route::get('accommodations', [CatalogController::class, 'accommodations'])->name('accommodations');
        });

    /*
    | Hoteles.
    */
    Route::middleware($readMiddleware)->group(function (): void {
        Route::get('hotels', [HotelController::class, 'index'])->name('api.v1.hotels.index');
        Route::get('hotels/{hotel}', [HotelController::class, 'show'])->name('api.v1.hotels.show');
    });

    Route::middleware($writeMiddleware)->group(function (): void {
        Route::post('hotels', [HotelController::class, 'store'])->name('api.v1.hotels.store');
        Route::put('hotels/{hotel}', [HotelController::class, 'update'])->name('api.v1.hotels.update');
        Route::delete('hotels/{hotel}', [HotelController::class, 'destroy'])->name('api.v1.hotels.destroy');
    });

    /*
    | Configuración de habitaciones, anidada bajo su hotel.
    */
    Route::middleware($readMiddleware)->group(function (): void {
        Route::get('hotels/{hotel}/rooms', [HotelRoomController::class, 'index'])
            ->name('api.v1.hotels.rooms.index');
    });

    Route::middleware($writeMiddleware)->group(function (): void {
        Route::post('hotels/{hotel}/rooms', [HotelRoomController::class, 'store'])
            ->name('api.v1.hotels.rooms.store');
        Route::put('hotels/{hotel}/rooms/{room}', [HotelRoomController::class, 'update'])
            ->name('api.v1.hotels.rooms.update');
        Route::delete('hotels/{hotel}/rooms/{room}', [HotelRoomController::class, 'destroy'])
            ->name('api.v1.hotels.rooms.destroy');
    });
});
