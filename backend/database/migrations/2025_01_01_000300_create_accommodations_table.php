<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Catálogo de acomodaciones: Sencilla, Doble, Triple y Cuádruple.
 *
 * `capacity` no lo exige el enunciado, pero documenta el significado de cada
 * acomodación y permite calcular aforo total del hotel sin codificar números
 * mágicos en la aplicación.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accommodations', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 60)->unique()
                ->comment('Nombre visible: Sencilla, Doble, Triple, Cuádruple');
            $table->string('slug', 60)->unique()
                ->comment('Identificador estable usado por la lógica de negocio');
            $table->unsignedSmallInteger('capacity')
                ->comment('Número de huéspedes que admite la acomodación');
            $table->unsignedSmallInteger('sort_order')->default(0)
                ->comment('Orden de presentación en la interfaz');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accommodations');
    }
};
