<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;

/**
 * Catálogo de ciudades colombianas con operación hotelera relevante.
 *
 * Se incluyen los códigos DANE oficiales porque son el identificador estándar
 * de municipio en Colombia, y tenerlos evita ambigüedades al cruzar esta
 * información con sistemas contables o tributarios.
 */
final class CitySeeder extends Seeder
{
    /**
     * @var list<array{name: string, dane_code: string}>
     */
    private const CITIES = [
        ['name' => 'Barranquilla', 'dane_code' => '08001'],
        ['name' => 'Bogotá D.C.', 'dane_code' => '11001'],
        ['name' => 'Bucaramanga', 'dane_code' => '68001'],
        ['name' => 'Cali', 'dane_code' => '76001'],
        ['name' => 'Cartagena', 'dane_code' => '13001'],
        ['name' => 'Cúcuta', 'dane_code' => '54001'],
        ['name' => 'Girardot', 'dane_code' => '25307'],
        ['name' => 'Medellín', 'dane_code' => '05001'],
        ['name' => 'Melgar', 'dane_code' => '73449'],
        ['name' => 'Montería', 'dane_code' => '23001'],
        ['name' => 'Pereira', 'dane_code' => '66001'],
        ['name' => 'Providencia', 'dane_code' => '88564'],
        ['name' => 'Riohacha', 'dane_code' => '44001'],
        ['name' => 'San Andrés', 'dane_code' => '88001'],
        ['name' => 'Santa Marta', 'dane_code' => '47001'],
        ['name' => 'Santiago de Tolú', 'dane_code' => '70823'],
    ];

    public function run(): void
    {
        foreach (self::CITIES as $city) {
            // `updateOrCreate` sobre el código DANE hace el seeder idempotente:
            // ejecutarlo dos veces no duplica ciudades ni falla por la
            // restricción UNIQUE.
            City::query()->updateOrCreate(
                ['dane_code' => $city['dane_code']],
                ['name' => $city['name']],
            );
        }
    }
}
