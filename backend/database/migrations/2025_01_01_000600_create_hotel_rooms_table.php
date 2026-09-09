<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Configuración de habitaciones de cada hotel.
 *
 * Cada fila responde a "cuántas habitaciones de tal tipo y tal acomodación
 * tiene este hotel", que es exactamente la tabla del ejemplo del enunciado:
 *
 *   CANTIDAD  TIPO HABITACIÓN  ACOMODACIÓN
 *   25        ESTANDAR         SENCILLA
 *   12        JUNIOR           TRIPLE
 *   5         ESTANDAR         DOBLE
 *
 * El criterio "no debe existir tipos de habitaciones y acomodaciones repetidas
 * para el mismo hotel" se garantiza con el índice único compuesto.
 *
 * El criterio "la cantidad configurada no debe superar el máximo por hotel" no
 * puede expresarse como CHECK porque involucra un agregado sobre otras filas;
 * se hace cumplir en el servicio, dentro de una transacción con bloqueo
 * pesimista sobre el hotel.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotel_rooms', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('hotel_id')
                ->comment('Hotel al que pertenece la configuración')
                ->constrained('hotels')
                ->cascadeOnDelete();

            $table->foreignId('room_type_id')
                ->comment('Tipo de habitación')
                ->constrained('room_types')
                ->restrictOnDelete();

            $table->foreignId('accommodation_id')
                ->comment('Acomodación asignada al tipo')
                ->constrained('accommodations')
                ->restrictOnDelete();

            $table->unsignedInteger('quantity')
                ->comment('Número de habitaciones con esta configuración');

            $table->timestamps();

            $table->unique(
                ['hotel_id', 'room_type_id', 'accommodation_id'],
                'hotel_rooms_unique_configuration'
            );

            $table->index('hotel_id', 'hotel_rooms_hotel_id_index');
        });

        DB::statement('ALTER TABLE hotel_rooms ADD CONSTRAINT hotel_rooms_quantity_positive CHECK (quantity > 0)');
    }

    public function down(): void
    {
        Schema::dropIfExists('hotel_rooms');
    }
};
