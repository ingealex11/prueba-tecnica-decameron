<?php

declare(strict_types=1);

use App\Models\RoomType;
use Database\Seeders\CatalogSeeder;
use Database\Seeders\CitySeeder;

/*
|--------------------------------------------------------------------------
| API de catálogos
|--------------------------------------------------------------------------
|
| El enunciado precisa que «no se requieren administradores para datos
| catálogos, como ciudades, tipos de habitación o acomodación». Estas pruebas
| verifican tanto que los catálogos se puedan consultar como que no se puedan
| modificar: la ausencia de escritura es un requisito, no un descuido, y por
| tanto merece una prueba que lo fije.
|
*/

beforeEach(function (): void {
    $this->seed([CitySeeder::class, CatalogSeeder::class]);
});

describe('GET /api/v1/catalogs/cities', function (): void {
    it('devuelve las ciudades en orden alfabético', function (): void {
        $response = $this->getJson('/api/v1/catalogs/cities')->assertOk();

        $names = collect($response->json('data'))->pluck('name')->all();

        expect($names)->not->toBeEmpty()
            ->and($names)->toBe(collect($names)->sort(SORT_NATURAL | SORT_FLAG_CASE)->values()->all());
    });
});

describe('GET /api/v1/catalogs/room-types', function (): void {
    it('devuelve cada tipo con las acomodaciones que admite', function (): void {
        $response = $this->getJson('/api/v1/catalogs/room-types')->assertOk();

        $porSlug = collect($response->json('data'))->keyBy('slug');

        // Es la misma matriz del enunciado, servida al frontend para que éste
        // limite las opciones sin duplicar la regla de negocio.
        expect(collect($porSlug[RoomType::STANDARD]['accommodations'])->pluck('slug')->all())
            ->toBe(['sencilla', 'doble'])
            ->and(collect($porSlug[RoomType::JUNIOR]['accommodations'])->pluck('slug')->all())
            ->toBe(['triple', 'cuadruple'])
            ->and(collect($porSlug[RoomType::SUITE]['accommodations'])->pluck('slug')->all())
            ->toBe(['sencilla', 'doble', 'triple']);
    });

    it('devuelve exactamente los tres tipos del enunciado', function (): void {
        $this->getJson('/api/v1/catalogs/room-types')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    });
});

describe('GET /api/v1/catalogs/accommodations', function (): void {
    it('devuelve las cuatro acomodaciones con su capacidad', function (): void {
        $this->getJson('/api/v1/catalogs/accommodations')
            ->assertOk()
            ->assertJsonCount(4, 'data')
            ->assertJsonStructure(['data' => [['id', 'name', 'slug', 'capacity']]]);
    });
});

describe('los catálogos son de sólo lectura', function (): void {
    it('no expone ningún endpoint de escritura', function (string $method, string $uri): void {
        // 405 confirma que la ruta existe pero no admite ese verbo; 404, que ni
        // siquiera existe. Cualquiera de los dos satisface el requisito; un 2xx
        // significaría que se puede administrar el catálogo.
        $status = $this->json($method, $uri, ['name' => 'Intento'])->getStatusCode();

        expect($status)->toBeIn([404, 405]);
    })->with([
        ['POST', '/api/v1/catalogs/cities'],
        ['PUT', '/api/v1/catalogs/cities'],
        ['DELETE', '/api/v1/catalogs/cities'],
        ['POST', '/api/v1/catalogs/room-types'],
        ['DELETE', '/api/v1/catalogs/room-types'],
        ['POST', '/api/v1/catalogs/accommodations'],
    ]);
});
