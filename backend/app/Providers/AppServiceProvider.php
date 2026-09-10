<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

final class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->defineApiDocsAccess();
    }

    /**
     * Quién puede consultar la documentación de la API.
     *
     * En local siempre está disponible. En cualquier otro entorno se decide
     * con `API_DOCS_PUBLIC`: activa en la instancia de demostración, para que
     * quien evalúe pueda explorar y probar la API; desactivada en un despliegue
     * real, donde la documentación revelaría la superficie completa del
     * sistema a cualquiera.
     */
    private function defineApiDocsAccess(): void
    {
        // El parámetro nullable es imprescindible: Laravel sólo evalúa una
        // puerta para visitantes sin sesión si su primer parámetro admite
        // null; de lo contrario deniega sin llamar al cierre. Sin él, la
        // documentación pública devolvía 403 en producción, mientras que en
        // local no se notaba porque ese entorno la abre sin consultar la puerta.
        Gate::define('viewApiDocs', static function (?User $user = null): bool {
            return app()->environment('local')
                || (bool) config('hotel.docs_public', false);
        });
    }
}
