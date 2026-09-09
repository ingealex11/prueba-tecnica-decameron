<?php

declare(strict_types=1);

namespace App\Domain\Hotel\Data;

/**
 * Datos necesarios para crear o actualizar un hotel.
 *
 * Es un objeto de transferencia inmutable: una vez construido no puede
 * modificarse. Esto evita que una capa intermedia altere los datos sin que las
 * demás se enteren, y hace que la firma de los servicios sea explícita en lugar
 * de recibir arrays sueltos cuyo contenido sólo se descubre leyendo el cuerpo
 * del método.
 */
final readonly class HotelData
{
    public function __construct(
        public string $name,
        public string $address,
        public int $cityId,
        public string $nit,
        public int $maxRooms,
    ) {}

    /**
     * Construye el DTO a partir de los datos ya validados de una petición.
     *
     * Se asume que el `FormRequest` correspondiente garantizó tipos y presencia
     * de los campos; este método sólo traduce de array a objeto tipado.
     *
     * @param  array<string, mixed>  $validated
     */
    public static function fromArray(array $validated): self
    {
        return new self(
            name: trim((string) $validated['name']),
            address: trim((string) $validated['address']),
            cityId: (int) $validated['city_id'],
            nit: trim((string) $validated['nit']),
            maxRooms: (int) $validated['max_rooms'],
        );
    }

    /**
     * Representación lista para persistir, con las claves de la tabla.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'address' => $this->address,
            'city_id' => $this->cityId,
            'nit' => $this->nit,
            'max_rooms' => $this->maxRooms,
        ];
    }
}
