<?php

declare(strict_types=1);

namespace App\Domain\Hotel\Rules;

use App\Models\Accommodation;
use App\Models\RoomType;

/**
 * Regla del tipo Junior.
 *
 * Enunciado: «Si el tipo de habitación es Junior: la acomodación debe ser
 * Triple o Cuádruple.»
 */
final class JuniorRoomRule implements AccommodationRule
{
    public function supports(string $roomTypeSlug): bool
    {
        return $roomTypeSlug === RoomType::JUNIOR;
    }

    /**
     * @return list<string>
     */
    public function allowedAccommodations(): array
    {
        return [
            Accommodation::TRIPLE,
            Accommodation::QUADRUPLE,
        ];
    }
}
