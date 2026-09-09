<?php

declare(strict_types=1);

use App\Models\Accommodation;
use App\Models\Hotel;
use App\Models\HotelRoom;
use App\Models\RoomType;
use Database\Seeders\CatalogSeeder;
use Database\Seeders\CitySeeder;

/*
|--------------------------------------------------------------------------
| API de configuración de habitaciones
|--------------------------------------------------------------------------
|
| Cubren las tres reglas centrales del enunciado, cada una con su caso válido
| y su caso de rechazo:
|
|   1. La acomodación debe corresponder al tipo de habitación.
|   2. No puede repetirse la combinación tipo + acomodación en un mismo hotel.
|   3. La suma de habitaciones no puede superar el máximo del hotel.
|
*/

beforeEach(function (): void {
    $this->seed([CitySeeder::class, CatalogSeeder::class]);

    $this->hotel = Hotel::factory()->withMaxRooms(42)->create(['name' => 'Decameron Cartagena']);

    // Se resuelven una vez y se reutilizan, para que cada prueba exprese la
    // intención ("Junior con Sencilla") y no el detalle de buscar sus IDs.
    $this->standard = RoomType::query()->where('slug', RoomType::STANDARD)->firstOrFail();
    $this->junior = RoomType::query()->where('slug', RoomType::JUNIOR)->firstOrFail();
    $this->suite = RoomType::query()->where('slug', RoomType::SUITE)->firstOrFail();

    $this->single = Accommodation::query()->where('slug', Accommodation::SINGLE)->firstOrFail();
    $this->double = Accommodation::query()->where('slug', Accommodation::DOUBLE)->firstOrFail();
    $this->triple = Accommodation::query()->where('slug', Accommodation::TRIPLE)->firstOrFail();
    $this->quadruple = Accommodation::query()->where('slug', Accommodation::QUADRUPLE)->firstOrFail();
});

/**
 * Envía una asignación de habitaciones al hotel de la prueba.
 */
function assignRoom(Hotel $hotel, RoomType $type, Accommodation $accommodation, int $quantity)
{
    return test()->postJson("/api/v1/hotels/{$hotel->id}/rooms", [
        'room_type_id' => $type->id,
        'accommodation_id' => $accommodation->id,
        'quantity' => $quantity,
    ]);
}

describe('regla 1 · la acomodación debe corresponder al tipo', function (): void {
    it('acepta las siete combinaciones válidas del enunciado', function (string $type, string $accommodation): void {
        $roomType = RoomType::query()->where('slug', $type)->firstOrFail();
        $acc = Accommodation::query()->where('slug', $accommodation)->firstOrFail();

        assignRoom($this->hotel, $roomType, $acc, 1)->assertCreated();
    })->with([
        [RoomType::STANDARD, Accommodation::SINGLE],
        [RoomType::STANDARD, Accommodation::DOUBLE],
        [RoomType::JUNIOR, Accommodation::TRIPLE],
        [RoomType::JUNIOR, Accommodation::QUADRUPLE],
        [RoomType::SUITE, Accommodation::SINGLE],
        [RoomType::SUITE, Accommodation::DOUBLE],
        [RoomType::SUITE, Accommodation::TRIPLE],
    ]);

    it('rechaza las cinco combinaciones inválidas', function (string $type, string $accommodation): void {
        $roomType = RoomType::query()->where('slug', $type)->firstOrFail();
        $acc = Accommodation::query()->where('slug', $accommodation)->firstOrFail();

        assignRoom($this->hotel, $roomType, $acc, 1)
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'INVALID_ACCOMMODATION_FOR_ROOM_TYPE');

        $this->assertDatabaseCount('hotel_rooms', 0);
    })->with([
        [RoomType::STANDARD, Accommodation::TRIPLE],
        [RoomType::STANDARD, Accommodation::QUADRUPLE],
        [RoomType::JUNIOR, Accommodation::SINGLE],
        [RoomType::JUNIOR, Accommodation::DOUBLE],
        [RoomType::SUITE, Accommodation::QUADRUPLE],
    ]);

    it('indica en el error qué acomodaciones sí son válidas', function (): void {
        assignRoom($this->hotel, $this->junior, $this->single, 1)
            ->assertStatus(422)
            ->assertJsonPath('meta.allowed_accommodations', ['Triple', 'Cuádruple'])
            ->assertJsonPath('meta.room_type', 'Junior');
    });
});

describe('regla 2 · no repetir tipo y acomodación en el mismo hotel', function (): void {
    it('impide asignar dos veces la misma combinación', function (): void {
        assignRoom($this->hotel, $this->standard, $this->single, 10)->assertCreated();

        assignRoom($this->hotel, $this->standard, $this->single, 5)
            ->assertStatus(409)
            ->assertJsonPath('error_code', 'DUPLICATE_ROOM_CONFIGURATION');

        $this->assertDatabaseCount('hotel_rooms', 1);
    });

    it('permite el mismo tipo con acomodación distinta', function (): void {
        // El ejemplo del enunciado tiene precisamente Estándar-Sencilla y
        // Estándar-Doble en el mismo hotel: es la unicidad de la pareja, no la
        // del tipo por sí solo.
        assignRoom($this->hotel, $this->standard, $this->single, 25)->assertCreated();
        assignRoom($this->hotel, $this->standard, $this->double, 5)->assertCreated();

        $this->assertDatabaseCount('hotel_rooms', 2);
    });

    it('permite la misma combinación en hoteles distintos', function (): void {
        $otro = Hotel::factory()->withMaxRooms(50)->create();

        assignRoom($this->hotel, $this->standard, $this->single, 10)->assertCreated();
        assignRoom($otro, $this->standard, $this->single, 10)->assertCreated();

        $this->assertDatabaseCount('hotel_rooms', 2);
    });
});

describe('regla 3 · no superar el máximo de habitaciones del hotel', function (): void {
    it('reproduce el ejemplo del enunciado: 25 + 12 + 5 = 42 de 42', function (): void {
        assignRoom($this->hotel, $this->standard, $this->single, 25)->assertCreated();
        assignRoom($this->hotel, $this->junior, $this->triple, 12)->assertCreated();
        assignRoom($this->hotel, $this->standard, $this->double, 5)->assertCreated();

        $this->getJson("/api/v1/hotels/{$this->hotel->id}")
            ->assertJsonPath('data.occupied_rooms', 42)
            ->assertJsonPath('data.available_rooms', 0);
    });

    it('acepta llegar exactamente al máximo', function (): void {
        assignRoom($this->hotel, $this->standard, $this->single, 42)->assertCreated();
    });

    it('rechaza superar el máximo aunque sea por una habitación', function (): void {
        assignRoom($this->hotel, $this->standard, $this->single, 42)->assertCreated();

        assignRoom($this->hotel, $this->junior, $this->triple, 1)
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'ROOM_CAPACITY_EXCEEDED')
            ->assertJsonPath('meta.available_rooms', 0);
    });

    it('informa cuántas habitaciones quedan disponibles al rechazar', function (): void {
        assignRoom($this->hotel, $this->standard, $this->single, 37)->assertCreated();

        assignRoom($this->hotel, $this->junior, $this->triple, 20)
            ->assertStatus(422)
            ->assertJsonPath('meta.available_rooms', 5)
            ->assertJsonPath('meta.requested_quantity', 20);
    });
});

describe('GET /api/v1/hotels/{id}/rooms', function (): void {
    it('lista las configuraciones del hotel', function (): void {
        assignRoom($this->hotel, $this->standard, $this->single, 10)->assertCreated();
        assignRoom($this->hotel, $this->junior, $this->triple, 5)->assertCreated();

        $this->getJson("/api/v1/hotels/{$this->hotel->id}/rooms")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonStructure(['data' => [['id', 'quantity', 'room_type', 'accommodation']]]);
    });

    it('devuelve 404 si el hotel no existe', function (): void {
        $this->getJson('/api/v1/hotels/999999/rooms')->assertNotFound();
    });
});

describe('PUT /api/v1/hotels/{id}/rooms/{room}', function (): void {
    it('actualiza la cantidad de una configuración', function (): void {
        $response = assignRoom($this->hotel, $this->standard, $this->single, 10);
        $roomId = $response->json('data.id');

        $this->putJson("/api/v1/hotels/{$this->hotel->id}/rooms/{$roomId}", [
            'room_type_id' => $this->standard->id,
            'accommodation_id' => $this->single->id,
            'quantity' => 30,
        ])
            ->assertOk()
            ->assertJsonPath('data.quantity', 30);
    });

    it('no cuenta dos veces la cantidad que se está reemplazando', function (): void {
        // Con 40 de 42 ocupadas, subir esa misma configuración a 42 debe
        // aceptarse: la cantidad anterior se libera. Si se contara el total sin
        // excluirla, 40 + 42 superaría el máximo y toda edición al alza
        // fallaría.
        $response = assignRoom($this->hotel, $this->standard, $this->single, 40);
        $roomId = $response->json('data.id');

        $this->putJson("/api/v1/hotels/{$this->hotel->id}/rooms/{$roomId}", [
            'room_type_id' => $this->standard->id,
            'accommodation_id' => $this->single->id,
            'quantity' => 42,
        ])->assertOk();
    });

    it('no se detecta a sí misma como combinación duplicada', function (): void {
        $response = assignRoom($this->hotel, $this->suite, $this->double, 10);
        $roomId = $response->json('data.id');

        $this->putJson("/api/v1/hotels/{$this->hotel->id}/rooms/{$roomId}", [
            'room_type_id' => $this->suite->id,
            'accommodation_id' => $this->double->id,
            'quantity' => 12,
        ])->assertOk();
    });

    it('impide que una edición choque con otra configuración existente', function (): void {
        assignRoom($this->hotel, $this->standard, $this->single, 10)->assertCreated();
        $segunda = assignRoom($this->hotel, $this->standard, $this->double, 10);

        $this->putJson("/api/v1/hotels/{$this->hotel->id}/rooms/{$segunda->json('data.id')}", [
            'room_type_id' => $this->standard->id,
            'accommodation_id' => $this->single->id,
            'quantity' => 10,
        ])->assertStatus(409);
    });

    it('sigue validando la acomodación al editar', function (): void {
        $response = assignRoom($this->hotel, $this->standard, $this->single, 10);

        $this->putJson("/api/v1/hotels/{$this->hotel->id}/rooms/{$response->json('data.id')}", [
            'room_type_id' => $this->junior->id,
            'accommodation_id' => $this->single->id,
            'quantity' => 10,
        ])->assertStatus(422)
            ->assertJsonPath('error_code', 'INVALID_ACCOMMODATION_FOR_ROOM_TYPE');
    });
});

describe('DELETE /api/v1/hotels/{id}/rooms/{room}', function (): void {
    it('elimina la configuración y libera su cupo', function (): void {
        $response = assignRoom($this->hotel, $this->standard, $this->single, 42);
        $roomId = $response->json('data.id');

        $this->deleteJson("/api/v1/hotels/{$this->hotel->id}/rooms/{$roomId}")
            ->assertNoContent();

        $this->assertDatabaseCount('hotel_rooms', 0);

        // El cupo liberado vuelve a estar disponible.
        assignRoom($this->hotel, $this->junior, $this->triple, 42)->assertCreated();
    });

    it('impide manipular una configuración a través de otro hotel', function (): void {
        // Sin comprobar la pertenencia, este DELETE borraría la configuración
        // de un hotel ajeno: es una referencia directa insegura a objetos.
        $otro = Hotel::factory()->withMaxRooms(50)->create();
        $response = assignRoom($otro, $this->standard, $this->single, 10);

        $this->deleteJson("/api/v1/hotels/{$this->hotel->id}/rooms/{$response->json('data.id')}")
            ->assertNotFound();

        $this->assertDatabaseCount('hotel_rooms', 1);
    });
});

describe('baja de un hotel con habitaciones configuradas', function (): void {
    it('conserva la configuración, que deja de ser accesible', function (): void {
        assignRoom($this->hotel, $this->standard, $this->single, 10)->assertCreated();

        $this->deleteJson("/api/v1/hotels/{$this->hotel->id}")->assertNoContent();

        // El borrado es lógico, así que la configuración permanece en la base
        // de datos: restaurar el hotel debe devolverlo tal como estaba.
        expect(HotelRoom::query()->where('hotel_id', $this->hotel->id)->count())->toBe(1);

        // Pero ya no se puede llegar a ella, porque el hotel no está activo.
        $this->getJson("/api/v1/hotels/{$this->hotel->id}/rooms")->assertNotFound();
    });

    it('libera el nombre y el NIT para un hotel nuevo', function (): void {
        // Los índices únicos son parciales sobre los hoteles activos. Sin esa
        // condición, el nombre de un hotel retirado quedaría bloqueado para
        // siempre y la aplicación diría que está libre mientras la base de
        // datos lo rechazaría.
        $nombre = $this->hotel->name;
        $nit = $this->hotel->nit;
        $ciudad = $this->hotel->city_id;

        $this->deleteJson("/api/v1/hotels/{$this->hotel->id}")->assertNoContent();

        $this->postJson('/api/v1/hotels', [
            'name' => $nombre,
            'address' => 'Nueva sede, Calle 1 2-3',
            'city_id' => $ciudad,
            'nit' => $nit,
            'max_rooms' => 30,
        ])->assertCreated();
    });
});

describe('validación de entrada', function (): void {
    it('exige los tres campos', function (): void {
        $this->postJson("/api/v1/hotels/{$this->hotel->id}/rooms", [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['room_type_id', 'accommodation_id', 'quantity']);
    });

    it('rechaza una cantidad no positiva')
        ->with([0, -3])
        ->expect(fn (int $quantity) => test()->postJson("/api/v1/hotels/{$this->hotel->id}/rooms", [
            'room_type_id' => $this->standard->id,
            'accommodation_id' => $this->single->id,
            'quantity' => $quantity,
        ]))
        ->assertStatus(422);

    it('rechaza un tipo de habitación inexistente', function (): void {
        $this->postJson("/api/v1/hotels/{$this->hotel->id}/rooms", [
            'room_type_id' => 999999,
            'accommodation_id' => $this->single->id,
            'quantity' => 5,
        ])->assertStatus(422)
            ->assertJsonValidationErrors('room_type_id');
    });
});
