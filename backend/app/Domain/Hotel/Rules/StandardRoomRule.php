<?php

declare(strict_types=1);

namespace App\Domain\Hotel\Rules;

use App\Models\Accommodation;
use App\Models\RoomType;

/**
 * Regla del tipo Estándar.
 *
 * Enunciado: «Si el tipo de habitación es Estándar: la acomodación debe ser
 * Sencilla o Doble.»
 */
final class StandardRoomRule implements AccommodationRule
{
    public function supports(string $roomTypeSlug): bool
    {
        return $roomTypeSlug === RoomType::STANDARD;
    }

    /**
     * @return list<string>
     */
    public function allowedAccommodations(): array
    {
        return [
            Accommodation::SINGLE,
            Accommodation::DOUBLE,
        ];
    }
}
