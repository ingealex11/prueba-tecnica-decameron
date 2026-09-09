<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\City;
use App\Models\Hotel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Hotel>
 */
final class HotelFactory extends Factory
{
    protected $model = Hotel::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'Hotel '.fake()->unique()->company(),
            'address' => fake()->streetAddress(),
            // Si ya hay ciudades sembradas se reutiliza una; si no, se crea.
            // Así la factory sirve tanto en pruebas con catálogo como sin él.
            'city_id' => City::query()->inRandomOrder()->value('id')
                ?? City::factory(),
            'nit' => fake()->unique()->numerify('#########').'-'.fake()->numberBetween(0, 9),
            'max_rooms' => fake()->numberBetween(20, 200),
        ];
    }

    /**
     * Hotel con una capacidad concreta, para probar los límites.
     */
    public function withMaxRooms(int $maxRooms): self
    {
        return $this->state(fn (): array => ['max_rooms' => $maxRooms]);
    }
}
