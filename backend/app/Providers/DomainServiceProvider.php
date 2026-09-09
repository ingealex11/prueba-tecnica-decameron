<?php

declare(strict_types=1);

namespace App\Providers;

use App\Domain\Hotel\Repositories\CatalogRepositoryInterface;
use App\Domain\Hotel\Repositories\HotelRepositoryInterface;
use App\Domain\Hotel\Repositories\RoomRepositoryInterface;
use App\Domain\Hotel\Rules\AccommodationRule;
use App\Domain\Hotel\Rules\AccommodationRuleResolver;
use App\Domain\Hotel\Services\HotelService;
use App\Domain\Hotel\Services\HotelServiceInterface;
use App\Domain\Hotel\Services\RoomAssignmentService;
use App\Domain\Hotel\Services\RoomAssignmentServiceInterface;
use App\Infrastructure\Persistence\Eloquent\EloquentCatalogRepository;
use App\Infrastructure\Persistence\Eloquent\EloquentHotelRepository;
use App\Infrastructure\Persistence\Eloquent\EloquentRoomRepository;
use Illuminate\Support\ServiceProvider;

/**
 * Enlaza las abstracciones del dominio con sus implementaciones concretas.
 *
 * Este archivo es el único lugar del sistema donde una interfaz se encuentra
 * con su implementación. Todo lo demás pide interfaces por constructor y el
 * contenedor las resuelve, lo que hace que sustituir una implementación
 * —en producción o en una prueba— sea un cambio de una línea aquí.
 */
final class DomainServiceProvider extends ServiceProvider
{
    /**
     * Repositorios: contrato del dominio -> implementación con Eloquent.
     *
     * @var array<class-string, class-string>
     */
    private const REPOSITORIES = [
        HotelRepositoryInterface::class => EloquentHotelRepository::class,
        RoomRepositoryInterface::class => EloquentRoomRepository::class,
        CatalogRepositoryInterface::class => EloquentCatalogRepository::class,
    ];

    /**
     * Servicios: contrato del caso de uso -> implementación.
     *
     * @var array<class-string, class-string>
     */
    private const SERVICES = [
        HotelServiceInterface::class => HotelService::class,
        RoomAssignmentServiceInterface::class => RoomAssignmentService::class,
    ];

    public function register(): void
    {
        $this->bindContracts();
        $this->registerAccommodationRules();
    }

    /**
     * Registra los enlaces de repositorios y servicios.
     *
     * Se usa `singleton` y no `bind` porque estas clases no guardan estado
     * asociado a una petición concreta: construir una instancia por inyección
     * sería trabajo desperdiciado. En el caso del repositorio de catálogos es
     * además necesario, ya que memoriza sus consultas durante la petición.
     */
    private function bindContracts(): void
    {
        foreach ([...self::REPOSITORIES, ...self::SERVICES] as $contract => $implementation) {
            $this->app->singleton($contract, $implementation);
        }
    }

    /**
     * Registra las reglas de acomodación declaradas en `config/hotel.php` y
     * las inyecta en el resolutor.
     *
     * El resolutor recibe las reglas desde fuera en lugar de instanciarlas: no
     * conoce ninguna implementación concreta y, por tanto, añadir un tipo de
     * habitación nuevo no exige modificarlo.
     */
    private function registerAccommodationRules(): void
    {
        /** @var list<class-string<AccommodationRule>> $ruleClasses */
        $ruleClasses = config('hotel.accommodation_rules', []);

        // El etiquetado del contenedor permite resolver el conjunto completo de
        // reglas como un iterable, sin enumerarlas de nuevo aquí.
        $this->app->tag($ruleClasses, 'accommodation.rules');

        $this->app->singleton(
            AccommodationRuleResolver::class,
            fn ($app) => new AccommodationRuleResolver(
                rules: $app->tagged('accommodation.rules')
            )
        );
    }
}
