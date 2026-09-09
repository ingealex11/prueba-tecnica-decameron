<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Matriz de combinaciones válidas entre tipo de habitación y acomodación.
 *
 * Materializa en datos la regla central del enunciado:
 *
 *   - Estándar -> Sencilla, Doble
 *   - Junior   -> Triple, Cuádruple
 *   - Suite    -> Sencilla, Doble, Triple
 *
 * Tenerla como catálogo, y no sólo como condicionales en el código, aporta dos
 * cosas: el frontend puede pedir las opciones válidas en lugar de duplicar la
 * regla, y añadir un tipo de habitación nuevo se resuelve con un registro en
 * lugar de con un despliegue.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_type_accommodation', function (Blueprint $table): void {
            $table->foreignId('room_type_id')
                ->comment('Tipo de habitación')
                ->constrained('room_types')
                ->cascadeOnDelete();

            $table->foreignId('accommodation_id')
                ->comment('Acomodación permitida para ese tipo')
                ->constrained('accommodations')
                ->cascadeOnDelete();

            // La clave primaria compuesta impide declarar dos veces la misma
            // combinación válida y da el índice de búsqueda gratis.
            $table->primary(['room_type_id', 'accommodation_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_type_accommodation');
    }
};
