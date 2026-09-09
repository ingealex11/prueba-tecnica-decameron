<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Catálogo de tipos de habitación: Estándar, Junior y Suite.
 *
 * El campo `slug` existe para que la lógica de negocio referencie los tipos
 * por un identificador estable y legible (`estandar`, `junior`, `suite`) en
 * lugar de por IDs numéricos o por nombres con tildes, que son frágiles ante
 * cambios de redacción.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_types', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 60)->unique()
                ->comment('Nombre visible: Estándar, Junior, Suite');
            $table->string('slug', 60)->unique()
                ->comment('Identificador estable usado por la lógica de negocio');
            $table->unsignedSmallInteger('sort_order')->default(0)
                ->comment('Orden de presentación en la interfaz');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_types');
    }
};
