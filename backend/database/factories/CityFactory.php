<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\City;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<City>
 */
final class CityFactory extends Factory
{
    protected $model = City::class;

    // El tipo de retorno lo declara el método padre; repetirlo aquí con la
    // sintaxis de Larastan no resulta analizable en la clase hija.
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->city(),
            // El código DANE es único; se genera con `unique()` para que crear
            // varias ciudades en una prueba no choque con la restricción.
            'dane_code' => (string) fake()->unique()->numberBetween(10000, 99999),
        ];
    }
}
