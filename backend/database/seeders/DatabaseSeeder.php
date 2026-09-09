<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Punto de entrada del poblado de la base de datos.
 *
 * El orden importa: los catálogos deben existir antes que los hoteles, porque
 * un hotel referencia una ciudad y sus configuraciones referencian tipos y
 * acomodaciones.
 */
final class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CitySeeder::class,
            CatalogSeeder::class,
        ]);

        // Los datos de demostración sólo se cargan fuera de producción: un
        // despliegue real no debe arrancar con hoteles de ejemplo dentro.
        if (! app()->environment('production')) {
            $this->call(HotelSeeder::class);
            $this->seedDemoUser();
        }
    }

    /**
     * Usuario de demostración para probar la API con autenticación activada.
     *
     * Sólo es útil cuando `API_AUTH_ENABLED=true`; con la autenticación
     * desactivada el usuario existe pero no se necesita. Su token se emite con
     * el comando `php artisan hotel:token`.
     */
    private function seedDemoUser(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'gerente@decameron.test'],
            [
                'name' => 'Gerente de Operaciones',
                'password' => bcrypt('decameron2026'),
            ],
        );
    }
}
