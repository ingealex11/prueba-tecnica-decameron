<?php

declare(strict_types=1);

namespace App\Domain\Hotel\Exceptions;

use App\Domain\Shared\Exceptions\DomainException;

/**
 * Existe un tipo de habitación en el catálogo para el que no hay ninguna regla
 * de acomodación registrada.
 *
 * No es un error del usuario sino una inconsistencia entre los datos y el
 * dominio: alguien insertó un tipo en la tabla sin crear su `AccommodationRule`.
 * Se responde con 500 porque el sistema no puede decidir, y el usuario no tiene
 * forma de corregirlo desde la interfaz.
 */
final class UnsupportedRoomTypeException extends DomainException
{
    public function __construct(string $roomTypeSlug)
    {
        parent::__construct(sprintf(
            'No hay una regla de acomodación registrada para el tipo de habitación "%s". '.
            'Revise que exista una implementación de AccommodationRule para ese tipo.',
            $roomTypeSlug,
        ));
    }

    public function statusCode(): int
    {
        return 500;
    }

    public function errorCode(): string
    {
        return 'UNSUPPORTED_ROOM_TYPE';
    }
}
