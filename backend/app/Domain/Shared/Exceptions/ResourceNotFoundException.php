<?php

declare(strict_types=1);

namespace App\Domain\Shared\Exceptions;

/**
 * Se solicitó un recurso que no existe.
 *
 * Se modela como excepción de dominio, y no se deja escapar la
 * `ModelNotFoundException` de Eloquent, por dos razones: el dominio no debe
 * filtrar detalles del ORM hacia la capa HTTP, y el mensaje al usuario queda en
 * el lenguaje del negocio ("El hotel solicitado no existe") en lugar de
 * mencionar clases internas.
 */
final class ResourceNotFoundException extends DomainException
{
    private function __construct(
        string $message,
        private readonly string $resource,
    ) {
        parent::__construct($message);
    }

    public static function hotel(int $id): self
    {
        return new self(
            sprintf('El hotel solicitado no existe o fue eliminado (id %d).', $id),
            'hotel',
        );
    }

    public static function room(int $id): self
    {
        return new self(
            sprintf('La configuración de habitación solicitada no existe (id %d).', $id),
            'hotel_room',
        );
    }

    public static function roomType(int $id): self
    {
        return new self(
            sprintf('El tipo de habitación solicitado no existe (id %d).', $id),
            'room_type',
        );
    }

    public static function accommodation(int $id): self
    {
        return new self(
            sprintf('La acomodación solicitada no existe (id %d).', $id),
            'accommodation',
        );
    }

    public function statusCode(): int
    {
        return 404;
    }

    public function errorCode(): string
    {
        return 'RESOURCE_NOT_FOUND';
    }

    /**
     * @return array<string, mixed>
     */
    public function context(): array
    {
        return ['resource' => $this->resource];
    }
}
