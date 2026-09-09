<?php

declare(strict_types=1);

namespace App\Domain\Hotel\Rules;

use App\Domain\Hotel\Exceptions\InvalidAccommodationException;
use App\Domain\Hotel\Exceptions\UnsupportedRoomTypeException;
use App\Models\Accommodation;
use App\Models\RoomType;

/**
 * Punto único de decisión sobre qué acomodaciones admite cada tipo de
 * habitación.
 *
 * Recibe el conjunto de reglas por inyección de dependencias (se registran en
 * `DomainServiceProvider`) y delega en la que corresponda. El resolutor no
 * conoce ninguna regla concreta: por eso añadir un tipo de habitación nuevo no
 * exige tocar esta clase.
 *
 * Es también la autoridad desde la que se deriva la tabla de catálogo
 * `room_type_accommodation`: el seeder la puebla a partir de estas reglas, de
 * modo que existe una sola fuente de verdad —el código del dominio— y la tabla
 * es una proyección suya que sirve para consultar y para documentar el esquema.
 */
final readonly class AccommodationRuleResolver
{
    /**
     * @param  iterable<AccommodationRule>  $rules  Reglas registradas en el contenedor.
     */
    public function __construct(
        private iterable $rules,
    ) {}

    /**
     * Devuelve la regla que gobierna el tipo de habitación indicado.
     *
     * @throws UnsupportedRoomTypeException si ningún tipo registrado lo soporta,
     *                                      lo que indica un catálogo inconsistente
     *                                      con las reglas del dominio.
     */
    public function resolve(string $roomTypeSlug): AccommodationRule
    {
        foreach ($this->rules as $rule) {
            if ($rule->supports($roomTypeSlug)) {
                return $rule;
            }
        }

        throw new UnsupportedRoomTypeException($roomTypeSlug);
    }

    /**
     * Acomodaciones permitidas para un tipo de habitación.
     *
     * @return list<string>
     */
    public function allowedFor(string $roomTypeSlug): array
    {
        return $this->resolve($roomTypeSlug)->allowedAccommodations();
    }

    /**
     * Indica si la combinación tipo + acomodación es válida.
     */
    public function isValid(string $roomTypeSlug, string $accommodationSlug): bool
    {
        return in_array(
            $accommodationSlug,
            $this->allowedFor($roomTypeSlug),
            strict: true
        );
    }

    /**
     * Verifica la combinación y aborta la operación si es inválida.
     *
     * Se expone junto a `isValid()` de forma deliberada: el frontend consulta la
     * versión que devuelve un booleano para habilitar o deshabilitar opciones,
     * mientras que el servicio usa esta, que garantiza que una combinación
     * inválida jamás continúe silenciosamente hacia la persistencia.
     *
     * @throws InvalidAccommodationException si el tipo no admite la acomodación.
     */
    public function assertValid(RoomType $roomType, Accommodation $accommodation): void
    {
        if ($this->isValid($roomType->slug, $accommodation->slug)) {
            return;
        }

        // El mensaje de error se construye con los nombres visibles del
        // catálogo, no con los slugs internos: quien lo lee es un gerente.
        throw new InvalidAccommodationException(
            roomTypeName: $roomType->name,
            accommodationName: $accommodation->name,
            allowed: $this->humanizeAllowed($roomType->slug),
        );
    }

    /**
     * Traduce los slugs permitidos a los nombres visibles del catálogo.
     *
     * @return list<string>
     */
    private function humanizeAllowed(string $roomTypeSlug): array
    {
        $slugs = $this->allowedFor($roomTypeSlug);

        /** @var list<string> $names */
        $names = Accommodation::query()
            ->whereIn('slug', $slugs)
            ->orderBy('sort_order')
            ->pluck('name')
            ->all();

        // Si el catálogo aún no está poblado (por ejemplo en una prueba
        // unitaria pura), los slugs siguen siendo un mensaje comprensible.
        return $names !== [] ? $names : $slugs;
    }
}
