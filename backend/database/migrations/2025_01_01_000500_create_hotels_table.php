<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Hoteles de la compañía, con sus datos básicos y tributarios.
 *
 * Dos criterios de aceptación del enunciado se hacen cumplir aquí a nivel de
 * motor, además de en la capa de aplicación:
 *
 *   - "No deben existir hoteles repetidos" -> UNIQUE en `name` y en `nit`.
 *   - El máximo de habitaciones debe ser un número positivo -> CHECK.
 *
 * La restricción a nivel de base de datos no es redundante: la validación de
 * la aplicación produce buenos mensajes de error, pero sólo el motor garantiza
 * la invariante frente a escrituras concurrentes o accesos externos.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotels', function (Blueprint $table): void {
            $table->id();

            $table->string('name', 150)->unique()
                ->comment('Razón comercial del hotel; único en toda la compañía');
            $table->string('address', 200)
                ->comment('Dirección física del inmueble');

            $table->foreignId('city_id')
                ->comment('Ciudad donde se ubica el hotel')
                ->constrained('cities')
                ->restrictOnDelete();

            $table->string('nit', 20)->unique()
                ->comment('NIT con dígito de verificación; texto, nunca numérico');

            $table->unsignedInteger('max_rooms')
                ->comment('Capacidad física declarada: tope de habitaciones configurables');

            $table->timestamps();
            $table->softDeletes()
                ->comment('Borrado lógico para conservar trazabilidad');

            $table->index('city_id', 'hotels_city_id_index');
            $table->index('deleted_at', 'hotels_deleted_at_index');
        });

        // `unsignedInteger` ya impide negativos; este CHECK añade que el hotel
        // declare al menos una habitación, que es lo que exige el negocio.
        DB::statement('ALTER TABLE hotels ADD CONSTRAINT hotels_max_rooms_positive CHECK (max_rooms > 0)');
    }

    public function down(): void
    {
        Schema::dropIfExists('hotels');
    }
};
