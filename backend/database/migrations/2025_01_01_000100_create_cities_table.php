<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Catálogo de ciudades donde la compañía puede tener hoteles.
 *
 * El enunciado indica explícitamente que los catálogos no requieren
 * administración, por lo que esta tabla se puebla por seeder y la API sólo
 * la expone en modo lectura.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cities', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 120)->unique()
                ->comment('Nombre de la ciudad');
            $table->string('dane_code', 8)->nullable()->unique()
                ->comment('Código DANE oficial del municipio');
            $table->timestamps();

            $table->index('name', 'cities_name_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cities');
    }
};
