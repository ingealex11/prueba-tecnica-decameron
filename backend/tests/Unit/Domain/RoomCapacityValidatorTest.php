<?php

declare(strict_types=1);

use App\Domain\Hotel\Exceptions\MaxRoomsBelowConfiguredException;
use App\Domain\Hotel\Exceptions\RoomCapacityExceededException;
use App\Domain\Hotel\Repositories\RoomRepositoryInterface;
use App\Domain\Hotel\Services\RoomCapacityValidator;
use App\Models\Hotel;

/*
|--------------------------------------------------------------------------
| Validación de capacidad
|--------------------------------------------------------------------------
|
| Verifican el criterio del enunciado «la cantidad de habitaciones configuradas
| no deben superar el máximo por hotel».
|
| El repositorio se sustituye por un doble, de modo que las pruebas describen
| escenarios ("el hotel ya tiene 37 de 42") sin necesitar base de datos. Esto
| sólo es posible porque el validador depende de una interfaz y no de Eloquent:
| es el beneficio concreto de la Inversión de Dependencias.
|
*/

/**
 * Crea un validador cuyo repositorio informa el total de habitaciones indicado.
 */
function validatorWithOccupied(int $occupied): RoomCapacityValidator
{
    $repository = Mockery::mock(RoomRepositoryInterface::class);
    $repository->shouldReceive('sumQuantities')->andReturn($occupied);

    return new RoomCapacityValidator($repository);
}

/**
 * Crea un hotel en memoria, sin persistirlo.
 */
function hotelWithMax(int $maxRooms, string $name = 'Hotel de Prueba'): Hotel
{
    $hotel = new Hotel(['name' => $name, 'max_rooms' => $maxRooms]);
    $hotel->id = 1;

    return $hotel;
}

describe('asignación de habitaciones', function (): void {
    it('acepta una cantidad que cabe holgadamente', function (): void {
        validatorWithOccupied(10)->assertFits(hotelWithMax(42), 5);
    })->throwsNoExceptions();

    it('acepta una cantidad que completa el máximo exacto', function (): void {
        // El límite es inclusivo: llegar justo al máximo es válido. Es el caso
        // frontera donde un `<` en lugar de un `<=` rompería el sistema.
        validatorWithOccupied(37)->assertFits(hotelWithMax(42), 5);
    })->throwsNoExceptions();

    it('rechaza una cantidad que supera el máximo por una sola habitación', function (): void {
        validatorWithOccupied(37)->assertFits(hotelWithMax(42), 6);
    })->throws(RoomCapacityExceededException::class);

    it('rechaza cualquier cantidad cuando el hotel ya está completo', function (): void {
        validatorWithOccupied(42)->assertFits(hotelWithMax(42), 1);
    })->throws(RoomCapacityExceededException::class);

    it('informa cuántas habitaciones quedan disponibles al rechazar', function (): void {
        // El mensaje debe decirle al gerente qué cantidad sí puede registrar;
        // rechazar sin explicar lo obligaría a probar por ensayo y error.
        try {
            validatorWithOccupied(37)->assertFits(hotelWithMax(42), 20);
            $this->fail('Se esperaba una excepción de capacidad excedida.');
        } catch (RoomCapacityExceededException $e) {
            expect($e->context())->toMatchArray([
                'max_rooms' => 42,
                'occupied_rooms' => 37,
                'available_rooms' => 5,
                'requested_quantity' => 20,
            ])->and($e->getMessage())->toContain('sólo quedan 5 disponibles');
        }
    });
});

describe('edición del máximo del hotel', function (): void {
    it('permite subir el máximo', function (): void {
        validatorWithOccupied(30)->assertMaxRoomsNotBelowConfigured(hotelWithMax(42), 60);
    })->throwsNoExceptions();

    it('permite bajar el máximo hasta lo ya configurado', function (): void {
        validatorWithOccupied(30)->assertMaxRoomsNotBelowConfigured(hotelWithMax(42), 30);
    })->throwsNoExceptions();

    it('impide bajar el máximo por debajo de lo ya configurado', function (): void {
        // Sin esta comprobación el hotel quedaría con más habitaciones
        // configuradas que su propio tope, violando la regla del enunciado por
        // una vía lateral.
        validatorWithOccupied(30)->assertMaxRoomsNotBelowConfigured(hotelWithMax(42), 25);
    })->throws(MaxRoomsBelowConfiguredException::class);
});
