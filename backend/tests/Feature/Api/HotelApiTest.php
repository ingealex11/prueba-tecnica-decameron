<?php

declare(strict_types=1);

use App\Models\City;
use App\Models\Hotel;
use Database\Seeders\CatalogSeeder;
use Database\Seeders\CitySeeder;

/*
|--------------------------------------------------------------------------
| API de hoteles
|--------------------------------------------------------------------------
|
| Recorren el sistema completo: petición HTTP, validación, servicio,
| repositorio y PostgreSQL. Verifican los criterios de aceptación del enunciado
| relativos a hoteles, incluidos los casos de fallo, que son los que de verdad
| demuestran que las reglas se aplican.
|
*/

beforeEach(function (): void {
    $this->seed([CitySeeder::class, CatalogSeeder::class]);
});

describe('GET /api/v1/hotels', function (): void {
    it('devuelve el listado paginado con la envoltura estándar', function (): void {
        Hotel::factory()->count(3)->create();

        $this->getJson('/api/v1/hotels')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'success',
                'data' => [['id', 'name', 'address', 'nit', 'max_rooms', 'occupied_rooms', 'available_rooms', 'city']],
                'meta' => ['pagination' => ['current_page', 'per_page', 'total', 'last_page']],
            ]);
    });

    it('busca por nombre sin distinguir mayúsculas ni acentos de posición', function (): void {
        Hotel::factory()->create(['name' => 'Decameron Cartagena']);
        Hotel::factory()->create(['name' => 'Hotel Las Américas']);

        $this->getJson('/api/v1/hotels?search=decameron')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Decameron Cartagena');
    });

    it('busca también por NIT', function (): void {
        Hotel::factory()->create(['nit' => '900123456-7']);
        Hotel::factory()->create(['nit' => '800999888-1']);

        $this->getJson('/api/v1/hotels?search=900123')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    });

    it('filtra por ciudad', function (): void {
        $cartagena = City::query()->where('name', 'Cartagena')->firstOrFail();
        $medellin = City::query()->where('name', 'Medellín')->firstOrFail();

        Hotel::factory()->count(2)->create(['city_id' => $cartagena->id]);
        Hotel::factory()->create(['city_id' => $medellin->id]);

        $this->getJson("/api/v1/hotels?city_id={$cartagena->id}")
            ->assertOk()
            ->assertJsonCount(2, 'data');
    });

    it('rechaza ordenar por una columna no permitida', function (): void {
        // `sort_by` acaba en una cláusula ORDER BY, así que restringirlo a una
        // lista cerrada es lo que cierra esa vía de inyección SQL.
        $this->getJson('/api/v1/hotels?sort_by=password')
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'VALIDATION_FAILED')
            ->assertJsonValidationErrors('sort_by');
    });

    it('acota el número de resultados por página', function (): void {
        $this->getJson('/api/v1/hotels?per_page=99999')
            ->assertStatus(422)
            ->assertJsonValidationErrors('per_page');
    });
});

describe('GET /api/v1/hotels/{id}', function (): void {
    it('devuelve el hotel con sus habitaciones y su capacidad calculada', function (): void {
        $hotel = Hotel::factory()->withMaxRooms(50)->create();

        $this->getJson("/api/v1/hotels/{$hotel->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $hotel->id)
            ->assertJsonPath('data.max_rooms', 50)
            ->assertJsonPath('data.occupied_rooms', 0)
            ->assertJsonPath('data.available_rooms', 50)
            ->assertJsonStructure(['data' => ['rooms', 'city']]);
    });

    it('devuelve 404 cuando el hotel no existe', function (): void {
        $this->getJson('/api/v1/hotels/999999')
            ->assertNotFound()
            ->assertJsonPath('error_code', 'RESOURCE_NOT_FOUND');
    });

    it('devuelve 404 cuando el identificador no es numérico', function (): void {
        // La restricción de ruta impide que llegue al controlador, donde
        // `(int) 'abc'` daría 0 y produciría un error confuso.
        $this->getJson('/api/v1/hotels/abc')->assertNotFound();
    });
});

describe('POST /api/v1/hotels', function (): void {
    it('registra un hotel con datos válidos', function (): void {
        $city = City::query()->where('name', 'Cartagena')->firstOrFail();

        $this->postJson('/api/v1/hotels', [
            'name' => 'Decameron Cartagena',
            'address' => 'Calle 23 58-25',
            'city_id' => $city->id,
            'nit' => '12345678-9',
            'max_rooms' => 42,
        ])
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Decameron Cartagena')
            ->assertJsonPath('data.max_rooms', 42)
            ->assertJsonPath('data.available_rooms', 42);

        $this->assertDatabaseHas('hotels', ['nit' => '12345678-9', 'max_rooms' => 42]);
    });

    it('impide registrar dos hoteles con el mismo nombre', function (): void {
        // Criterio del enunciado: «No deben existir hoteles repetidos».
        Hotel::factory()->create(['name' => 'Decameron Cartagena']);

        $this->postJson('/api/v1/hotels', [
            'name' => 'Decameron Cartagena',
            'address' => 'Otra dirección 45-67',
            'city_id' => City::query()->value('id'),
            'nit' => '999888777-1',
            'max_rooms' => 30,
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('name');

        expect(Hotel::query()->where('name', 'Decameron Cartagena')->count())->toBe(1);
    });

    it('impide registrar dos hoteles con el mismo NIT', function (): void {
        Hotel::factory()->create(['nit' => '12345678-9']);

        $this->postJson('/api/v1/hotels', [
            'name' => 'Hotel Distinto',
            'address' => 'Calle 100 20-30',
            'city_id' => City::query()->value('id'),
            'nit' => '12345678-9',
            'max_rooms' => 30,
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('nit');
    });

    it('normaliza los espacios sobrantes del nombre', function (): void {
        // Sin normalizar, "  Hotel  " burlaría la regla de unicidad.
        Hotel::factory()->create(['name' => 'Decameron Barú']);

        $this->postJson('/api/v1/hotels', [
            'name' => '   Decameron Barú   ',
            'address' => 'Playa Blanca',
            'city_id' => City::query()->value('id'),
            'nit' => '111222333-4',
            'max_rooms' => 20,
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('name');
    });

    it('exige todos los campos obligatorios', function (): void {
        $this->postJson('/api/v1/hotels', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'address', 'city_id', 'nit', 'max_rooms']);
    });

    it('rechaza un número de habitaciones no positivo')
        ->with([0, -5])
        ->expect(fn (int $maxRooms) => test()->postJson('/api/v1/hotels', [
            'name' => 'Hotel Prueba '.$maxRooms,
            'address' => 'Calle 1 2-3',
            'city_id' => City::query()->value('id'),
            'nit' => '55566677'.abs($maxRooms).'-1',
            'max_rooms' => $maxRooms,
        ]))
        ->assertStatus(422);

    it('rechaza un NIT con formato inválido', function (): void {
        $this->postJson('/api/v1/hotels', [
            'name' => 'Hotel Formato',
            'address' => 'Calle 1 2-3',
            'city_id' => City::query()->value('id'),
            'nit' => 'NIT-INVALIDO',
            'max_rooms' => 10,
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('nit');
    });

    it('rechaza una ciudad inexistente', function (): void {
        $this->postJson('/api/v1/hotels', [
            'name' => 'Hotel Sin Ciudad',
            'address' => 'Calle 1 2-3',
            'city_id' => 999999,
            'nit' => '444555666-2',
            'max_rooms' => 10,
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('city_id');
    });
});

describe('PUT /api/v1/hotels/{id}', function (): void {
    it('actualiza los datos de un hotel', function (): void {
        $hotel = Hotel::factory()->create(['name' => 'Nombre Original']);

        $this->putJson("/api/v1/hotels/{$hotel->id}", [
            'name' => 'Nombre Actualizado',
            'address' => 'Nueva dirección 10-20',
            'city_id' => $hotel->city_id,
            'nit' => $hotel->nit,
            'max_rooms' => 99,
        ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Nombre Actualizado')
            ->assertJsonPath('data.max_rooms', 99);
    });

    it('permite guardar un hotel sin cambiarle el nombre ni el NIT', function (): void {
        // La unicidad debe excluir el propio registro; en caso contrario el
        // hotel se acusaría a sí mismo de estar duplicado.
        $hotel = Hotel::factory()->create();

        $this->putJson("/api/v1/hotels/{$hotel->id}", [
            'name' => $hotel->name,
            'address' => 'Dirección modificada 1-2',
            'city_id' => $hotel->city_id,
            'nit' => $hotel->nit,
            'max_rooms' => $hotel->max_rooms,
        ])->assertOk();
    });

    it('impide tomar el nombre de otro hotel existente', function (): void {
        Hotel::factory()->create(['name' => 'Hotel Ocupado']);
        $hotel = Hotel::factory()->create(['name' => 'Hotel Propio']);

        $this->putJson("/api/v1/hotels/{$hotel->id}", [
            'name' => 'Hotel Ocupado',
            'address' => $hotel->address,
            'city_id' => $hotel->city_id,
            'nit' => $hotel->nit,
            'max_rooms' => $hotel->max_rooms,
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('name');
    });

    it('devuelve 404 al actualizar un hotel inexistente', function (): void {
        $this->putJson('/api/v1/hotels/999999', [
            'name' => 'Cualquiera',
            'address' => 'Calle 1 2-3',
            'city_id' => City::query()->value('id'),
            'nit' => '123123123-1',
            'max_rooms' => 10,
        ])->assertNotFound();
    });
});

describe('DELETE /api/v1/hotels/{id}', function (): void {
    it('da de baja un hotel y responde sin cuerpo', function (): void {
        $hotel = Hotel::factory()->create();

        $this->deleteJson("/api/v1/hotels/{$hotel->id}")
            ->assertNoContent();

        // El borrado es lógico: la fila permanece para conservar trazabilidad.
        $this->assertSoftDeleted('hotels', ['id' => $hotel->id]);
    });

    it('deja de listar un hotel eliminado', function (): void {
        $hotel = Hotel::factory()->create();
        $this->deleteJson("/api/v1/hotels/{$hotel->id}");

        $this->getJson('/api/v1/hotels')->assertJsonCount(0, 'data');
        $this->getJson("/api/v1/hotels/{$hotel->id}")->assertNotFound();
    });

    it('devuelve 404 al eliminar un hotel inexistente', function (): void {
        $this->deleteJson('/api/v1/hotels/999999')->assertNotFound();
    });
});
