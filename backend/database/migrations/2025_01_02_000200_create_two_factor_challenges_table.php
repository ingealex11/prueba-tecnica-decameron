<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Desafíos de segundo factor de autenticación.
 *
 * Cuando alguien supera la verificación de contraseña todavía no recibe un
 * token de sesión: se crea aquí un desafío con un código de seis dígitos y se
 * le entrega su identificador. Sólo al resolverlo correctamente se emite el
 * token.
 *
 * Tres decisiones que importan:
 *
 *   - **El código se guarda cifrado**, nunca en claro. Quien consiguiera leer
 *     esta tabla no podría completar la autenticación de nadie, igual que
 *     ocurre con las contraseñas.
 *
 *   - **Caduca.** Un código sin vencimiento sigue siendo válido semanas
 *     después, lo que anula buena parte del sentido del segundo factor.
 *
 *   - **Se cuentan los intentos.** Seis dígitos son un millón de
 *     combinaciones, que un script agota en minutos si se le permite probar
 *     sin límite. Con un tope de intentos, el desafío se invalida mucho antes.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('two_factor_challenges', function (Blueprint $table): void {
            // Identificador público del desafío. Se usa un UUID en lugar del ID
            // autoincremental porque viaja hasta el cliente: un número
            // correlativo revelaría cuántos inicios de sesión hay en el sistema
            // y permitiría referirse a los desafíos de otras personas.
            $table->uuid('id')->primary();

            $table->foreignId('user_id')
                ->comment('Usuario que está autenticándose')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('code_hash')
                ->comment('Código de seis dígitos, cifrado; nunca en claro');

            $table->unsignedTinyInteger('attempts')->default(0)
                ->comment('Intentos fallidos consumidos');

            $table->timestamp('expires_at')
                ->comment('Momento a partir del cual el desafío deja de ser válido');

            $table->timestamp('consumed_at')->nullable()
                ->comment('Momento en que se resolvió; impide reutilizarlo');

            $table->timestamps();

            // Los desafíos caducados se purgan periódicamente; el índice hace
            // que esa limpieza no recorra la tabla entera.
            $table->index('expires_at', 'two_factor_challenges_expires_at_index');
            $table->index('user_id', 'two_factor_challenges_user_id_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('two_factor_challenges');
    }
};
