<?php

declare(strict_types=1);

namespace App\Domain\Hotel\Rules;

/**
 * Regla que determina qué acomodaciones admite un tipo de habitación.
 *
 * Es el contrato del patrón Strategy: cada tipo de habitación del enunciado
 * tiene su propia implementación, y el resolutor elige la que corresponde en
 * tiempo de ejecución.
 *
 * El motivo de modelarlo así en lugar de con un `match` o una cadena de `if`
 * es el principio Abierto/Cerrado. Cuando el negocio incorpore un tipo nuevo
 * —por ejemplo "Presidencial"— se añade una clase que implemente esta interfaz
 * y se registra en la configuración: ningún archivo existente se modifica, y
 * por tanto ninguna regla ya probada puede romperse por accidente.
 *
 * La interfaz es deliberadamente mínima (dos métodos), en línea con el
 * principio de Segregación de Interfaces: quien implemente una regla no debe
 * verse obligado a definir comportamiento que no le concierne.
 */
interface AccommodationRule
{
    /**
     * Indica si esta regla es la que gobierna el tipo de habitación dado.
     *
     * @param  string  $roomTypeSlug  Identificador estable del tipo
     *                                (`estandar`, `junior`, `suite`).
     */
    public function supports(string $roomTypeSlug): bool;

    /**
     * Acomodaciones permitidas para el tipo que esta regla gobierna.
     *
     * @return list<string> Slugs de acomodación, en orden de presentación.
     */
    public function allowedAccommodations(): array;
}
