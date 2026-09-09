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

            $table->string('name', 150)
                ->comment('Razón comercial del hotel; único entre los hoteles activos');
            $table->string('address', 200)
                ->comment('Dirección física del inmueble');

            $table->foreignId('city_id')
                ->comment('Ciudad donde se ubica el hotel')
                ->constrained('cities')
                ->restrictOnDelete();

            $table->string('nit', 20)
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

        /*
         * Unicidad de nombre y NIT mediante índices únicos PARCIALES.
         *
         * Un UNIQUE corriente abarcaría también las filas con borrado lógico, y
         * entonces el nombre de un hotel dado de baja quedaría bloqueado para
         * siempre: la aplicación aceptaría reutilizarlo y la base de datos lo
         * rechazaría, dejando las dos barreras en desacuerdo.
         *
         * La cláusula WHERE deleted_at IS NULL —una característica de
         * PostgreSQL— restringe el índice a los hoteles activos, que es
         * exactamente lo que valida la aplicación. Ambas barreras quedan así
         * alineadas: se impide duplicar hoteles vigentes y se permite reutilizar
         * el nombre de uno retirado.
         */
        DB::statement(
            'CREATE UNIQUE INDEX hotels_name_unique_active ON hotels (name) WHERE deleted_at IS NULL'
        );

        DB::statement(
            'CREATE UNIQUE INDEX hotels_nit_unique_active ON hotels (nit) WHERE deleted_at IS NULL'
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('hotels');
    }
};
