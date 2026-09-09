<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domain\Hotel\Rules\AccommodationRuleResolver;
use App\Models\Accommodation;
use App\Models\RoomType;
use Illuminate\Database\Seeder;

/**
 * Catálogo de tipos de habitación y acomodaciones, más la matriz de
 * combinaciones válidas entre ambos.
 *
 * El punto importante de este seeder es cómo construye la matriz: no la
 * escribe a mano, sino que se la pregunta al `AccommodationRuleResolver`, que
 * es donde vive la regla del enunciado.
 *
 * Así hay una única fuente de verdad. Si alguien modifica `JuniorRoomRule` y
 * olvida actualizar el seeder, no ocurre nada: el seeder ya deriva de la regla.
 * Escribir la matriz dos veces —una en las clases y otra aquí— es exactamente
 * el tipo de duplicación que acaba divergiendo en silencio.
 */
final class CatalogSeeder extends Seeder
{
    /**
     * @var list<array{name: string, slug: string, sort_order: int}>
     */
    private const ROOM_TYPES = [
        ['name' => 'Estándar', 'slug' => RoomType::STANDARD, 'sort_order' => 1],
        ['name' => 'Junior', 'slug' => RoomType::JUNIOR, 'sort_order' => 2],
        ['name' => 'Suite', 'slug' => RoomType::SUITE, 'sort_order' => 3],
    ];

    /**
     * @var list<array{name: string, slug: string, capacity: int, sort_order: int}>
     */
    private const ACCOMMODATIONS = [
        ['name' => 'Sencilla', 'slug' => Accommodation::SINGLE, 'capacity' => 1, 'sort_order' => 1],
        ['name' => 'Doble', 'slug' => Accommodation::DOUBLE, 'capacity' => 2, 'sort_order' => 2],
        ['name' => 'Triple', 'slug' => Accommodation::TRIPLE, 'capacity' => 3, 'sort_order' => 3],
        ['name' => 'Cuádruple', 'slug' => Accommodation::QUADRUPLE, 'capacity' => 4, 'sort_order' => 4],
    ];

    public function __construct(
        private readonly AccommodationRuleResolver $ruleResolver,
    ) {}

    public function run(): void
    {
        $this->seedRoomTypes();
        $this->seedAccommodations();
        $this->seedValidCombinations();
    }

    private function seedRoomTypes(): void
    {
        foreach (self::ROOM_TYPES as $type) {
            RoomType::query()->updateOrCreate(
                ['slug' => $type['slug']],
                ['name' => $type['name'], 'sort_order' => $type['sort_order']],
            );
        }
    }

    private function seedAccommodations(): void
    {
        foreach (self::ACCOMMODATIONS as $accommodation) {
            Accommodation::query()->updateOrCreate(
                ['slug' => $accommodation['slug']],
                [
                    'name' => $accommodation['name'],
                    'capacity' => $accommodation['capacity'],
                    'sort_order' => $accommodation['sort_order'],
                ],
            );
        }
    }

    /**
     * Puebla la matriz de combinaciones válidas a partir de las reglas del
     * dominio.
     */
    private function seedValidCombinations(): void
    {
        // Un único acceso al catálogo de acomodaciones, indexado por slug, en
        // lugar de una consulta por cada combinación.
        $accommodationIds = Accommodation::query()
            ->pluck('id', 'slug');

        RoomType::query()->each(function (RoomType $roomType) use ($accommodationIds): void {
            $allowedSlugs = $this->ruleResolver->allowedFor($roomType->slug);

            $allowedIds = collect($allowedSlugs)
                ->map(static fn (string $slug): ?int => $accommodationIds[$slug] ?? null)
                ->filter()
                ->all();

            // `sync` deja la tabla pivote exactamente igual a lo que dictan las
            // reglas: añade lo que falta y elimina lo que sobra. Si una regla
            // se restringe, la combinación retirada desaparece del catálogo.
            $roomType->accommodations()->sync($allowedIds);
        });
    }
}
