<?php

declare(strict_types=1);

namespace App\Domain\Shared\Exceptions;

use RuntimeException;

/**
 * Base de todas las violaciones de reglas de negocio del sistema.
 *
 * Una excepción de dominio no es un error del programa: es la forma en que la
 * capa de negocio comunica que una operación es legítima como petición pero
 * inválida según las reglas. Por eso lleva consigo el código HTTP con que debe
 * responderse y los errores asociados a cada campo, y el manejador global se
 * limita a serializarla sin tener que conocer cada caso particular.
 *
 * La alternativa —devolver códigos de error o booleanos desde los servicios—
 * obligaría a cada llamador a acordarse de comprobarlos, y un olvido pasaría
 * silenciosamente.
 */
abstract class DomainException extends RuntimeException
{
    /**
     * Código HTTP con el que debe responderse esta violación.
     *
     * Por defecto 422 (Unprocessable Entity): la petición está bien formada
     * pero es semánticamente inválida.
     */
    public function statusCode(): int
    {
        return 422;
    }

    /**
     * Clave estable de la regla violada.
     *
     * Permite al frontend reaccionar de forma distinta según el error sin
     * depender del texto del mensaje, que puede traducirse o reescribirse.
     */
    abstract public function errorCode(): string;

    /**
     * Errores asociados a campos concretos del formulario.
     *
     * Comparte formato con los errores de validación de Laravel para que el
     * cliente los procese con el mismo código, sin ramificar según el origen.
     *
     * @return array<string, list<string>>
     */
    public function errors(): array
    {
        return [];
    }

    /**
     * Contexto adicional útil para el cliente.
     *
     * Por ejemplo, cuántas habitaciones quedan disponibles cuando se rechaza
     * una asignación por capacidad.
     *
     * @return array<string, mixed>
     */
    public function context(): array
    {
        return [];
    }
}
