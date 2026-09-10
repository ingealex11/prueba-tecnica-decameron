<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Datos de demostración: los hoteles de ejemplo y la persona con la que se
 * inicia sesión.
 *
 * Se agrupan en un seeder propio para poder ejecutarlo de forma explícita
 * (`php artisan db:seed --class=DemoSeeder`) o condicionarlo con la bandera
 * `hotel.demo_seed`, sin mezclarlo con los catálogos, que sí son datos reales
 * del negocio y se cargan siempre.
 */
final class DemoSeeder extends Seeder
{
    /** Credenciales de la persona de demostración; se muestran en el inicio de sesión. */
    public const EMAIL = 'gerente@decameron.test';

    public const PASSWORD = 'decameron2026';

    public function run(): void
    {
        $this->call(HotelSeeder::class);

        User::query()->updateOrCreate(
            ['email' => self::EMAIL],
            [
                'name' => 'Gerente de Operaciones',
                'password' => bcrypt(self::PASSWORD),
            ],
        );
    }
}
