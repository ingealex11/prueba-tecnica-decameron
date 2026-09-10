<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Ubicación geográfica del hotel.
 *
 * El enunciado pide la dirección como texto y eso es lo que el gerente escribe,
 * pero una dirección escrita no permite situar el hotel en un mapa ni calcular
 * distancias. Guardar las coordenadas junto a ella habilita ambas cosas sin
 * perder el dato original.
 *
 * Son opcionales de forma deliberada: un hotel debe poder registrarse aunque su
 * ubicación exacta no se conozca todavía. Obligarlas convertiría un dato
 * complementario en un impedimento para el alta.
 *
 * Se usa `decimal` y no `float`: las coordenadas son valores exactos y la
 * aritmética de coma flotante introduce desviaciones que, a escala de mapa, se
 * traducen en metros de error. Con 7 decimales la precisión es de unos 11 cm,
 * más que suficiente para localizar un edificio.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hotels', function (Blueprint $table): void {
            $table->decimal('latitude', 10, 7)->nullable()
                ->after('address')
                ->comment('Latitud en grados decimales, entre -90 y 90');

            $table->decimal('longitude', 10, 7)->nullable()
                ->after('latitude')
                ->comment('Longitud en grados decimales, entre -180 y 180');
        });

        /*
         * Rango válido de coordenadas.
         *
         * Sin esta restricción, una latitud de 200 se guardaría sin protestar y
         * el mapa la dibujaría en un punto imposible, o directamente fallaría.
         * La comprobación acepta que ambas sean nulas, que es el caso de un
         * hotel aún sin ubicar.
         */
        DB::statement(<<<'SQL'
            ALTER TABLE hotels ADD CONSTRAINT hotels_coordinates_range CHECK (
                (latitude IS NULL AND longitude IS NULL)
                OR (
                    latitude BETWEEN -90 AND 90
                    AND longitude BETWEEN -180 AND 180
                )
            )
        SQL);
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE hotels DROP CONSTRAINT IF EXISTS hotels_coordinates_range');

        Schema::table('hotels', function (Blueprint $table): void {
            $table->dropColumn(['latitude', 'longitude']);
        });
    }
};
