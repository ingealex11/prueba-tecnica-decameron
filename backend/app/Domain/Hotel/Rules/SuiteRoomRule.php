<?php

declare(strict_types=1);

namespace App\Domain\Hotel\Rules;

use App\Models\Accommodation;
use App\Models\RoomType;

/**
 * Regla del tipo Suite.
 *
 * Enunciado: «Si el tipo de habitación es Suite: la acomodación debe ser
 * Sencilla, Doble o Triple.»
 */
final class SuiteRoomRule implements AccommodationRule
{
    public function supports(string $roomTypeSlug): bool
    {
        return $roomTypeSlug === RoomType::SUITE;
    }

    /**
     * @return list<string>
     */
    public function allowedAccommodations(): array
    {
        return [
            Accommodation::SINGLE,
            Accommodation::DOUBLE,
            Accommodation::TRIPLE,
        ];
    }
}
