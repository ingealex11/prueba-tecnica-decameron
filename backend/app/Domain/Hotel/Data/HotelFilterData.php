<?php

declare(strict_types=1);

namespace App\Domain\Hotel\Data;

/**
 * Criterios de búsqueda, ordenamiento y paginación del listado de hoteles.
 *
 * Agrupar los filtros en un objeto evita firmas de método con cinco parámetros
 * opcionales, en las que el orden importa y una llamada como
 * `paginate(null, null, 15, 'name', 'asc')` no dice nada al lector.
 */
final readonly class HotelFilterData
{
    /** Campos por los que se permite ordenar; protege contra inyección en ORDER BY. */
    public const SORTABLE = ['name', 'nit', 'max_rooms', 'created_at'];

    /** Tope de resultados por página, para que un cliente no pida 100 000 filas. */
    public const MAX_PER_PAGE = 100;

    public function __construct(
        public ?string $search = null,
        public ?int $cityId = null,
        public int $perPage = 15,
        public string $sortBy = 'name',
        public string $sortDirection = 'asc',
    ) {}

    /**
     * Construye el DTO desde los parámetros de consulta ya validados.
     *
     * Aun cuando el `FormRequest` valida, aquí se vuelven a acotar los valores:
     * el DTO puede construirse desde una prueba o desde un comando de consola,
     * y debe ser seguro por sí mismo.
     *
     * @param  array<string, mixed>  $validated
     */
    public static function fromArray(array $validated): self
    {
        $sortBy = (string) ($validated['sort_by'] ?? 'name');
        $direction = strtolower((string) ($validated['sort_direction'] ?? 'asc'));

        return new self(
            search: isset($validated['search']) ? trim((string) $validated['search']) : null,
            cityId: isset($validated['city_id']) ? (int) $validated['city_id'] : null,
            perPage: min(
                max((int) ($validated['per_page'] ?? 15), 1),
                self::MAX_PER_PAGE
            ),
            sortBy: in_array($sortBy, self::SORTABLE, true) ? $sortBy : 'name',
            sortDirection: $direction === 'desc' ? 'desc' : 'asc',
        );
    }
}
