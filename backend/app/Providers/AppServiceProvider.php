<?php

declare(strict_types=1);

namespace App\Providers;

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
        Gate::define('viewApiDocs', static function (): bool {
            return app()->environment('local')
                || (bool) config('hotel.docs_public', false);
        });
    }
}
