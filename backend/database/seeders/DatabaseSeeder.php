<?php

declare(strict_types=1);

namespace Database\Seeders;

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

        /*
         * Los datos de demostración se cargan según una bandera explícita y no
         * según el entorno: la instancia pública de evaluación corre en
         * `production` —con depuración apagada y cachés compiladas— y aun así
         * necesita los hoteles de ejemplo y la persona de prueba. Un despliegue
         * real deja `DEMO_SEED=false` y arranca vacío.
         */
        if (config('hotel.demo_seed')) {
            $this->call(DemoSeeder::class);
        }
    }
}
