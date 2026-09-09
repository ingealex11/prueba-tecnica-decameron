<?php

declare(strict_types=1);

use App\Domain\Hotel\Exceptions\UnsupportedRoomTypeException;
use App\Domain\Hotel\Rules\AccommodationRule;
use App\Domain\Hotel\Rules\AccommodationRuleResolver;
use App\Domain\Hotel\Rules\JuniorRoomRule;
use App\Domain\Hotel\Rules\StandardRoomRule;
use App\Domain\Hotel\Rules\SuiteRoomRule;
use App\Models\Accommodation;
use App\Models\RoomType;

/*
|--------------------------------------------------------------------------
| Reglas de acomodación por tipo de habitación
|--------------------------------------------------------------------------
|
| Verifican la regla central del enunciado:
|
|   - Estándar -> Sencilla o Doble
|   - Junior   -> Triple o Cuádruple
|   - Suite    -> Sencilla, Doble o Triple
|
| Se ejecutan sin base de datos: las reglas son lógica pura y no deben
| necesitarla. Que puedan probarse así es la evidencia de que el dominio está
| efectivamente desacoplado de la persistencia.
|
*/

/**
 * Construye un resolutor con las tres reglas del enunciado registradas.
 */
function resolver(): AccommodationRuleResolver
{
    return new AccommodationRuleResolver([
        new StandardRoomRule,
        new JuniorRoomRule,
        new SuiteRoomRule,
    ]);
}

describe('acomodaciones permitidas por tipo', function (): void {
    it('permite a Estándar únicamente Sencilla y Doble', function (): void {
        expect(resolver()->allowedFor(RoomType::STANDARD))
            ->toBe([Accommodation::SINGLE, Accommodation::DOUBLE]);
    });

    it('permite a Junior únicamente Triple y Cuádruple', function (): void {
        expect(resolver()->allowedFor(RoomType::JUNIOR))
            ->toBe([Accommodation::TRIPLE, Accommodation::QUADRUPLE]);
    });

    it('permite a Suite únicamente Sencilla, Doble y Triple', function (): void {
        expect(resolver()->allowedFor(RoomType::SUITE))
            ->toBe([Accommodation::SINGLE, Accommodation::DOUBLE, Accommodation::TRIPLE]);
    });
});

describe('combinaciones válidas', function (): void {
    it('acepta las combinaciones que el enunciado declara válidas')
        ->with([
            [RoomType::STANDARD, Accommodation::SINGLE],
            [RoomType::STANDARD, Accommodation::DOUBLE],
            [RoomType::JUNIOR, Accommodation::TRIPLE],
            [RoomType::JUNIOR, Accommodation::QUADRUPLE],
            [RoomType::SUITE, Accommodation::SINGLE],
            [RoomType::SUITE, Accommodation::DOUBLE],
            [RoomType::SUITE, Accommodation::TRIPLE],
        ])
        ->expect(fn (string $type, string $accommodation): bool => resolver()->isValid($type, $accommodation))
        ->toBeTrue();

    /*
    | Este conjunto es el complemento exacto del anterior: las cinco
    | combinaciones que quedan de las doce posibles (3 tipos x 4 acomodaciones).
    | Probar sólo las válidas dejaría sin verificar que las inválidas se
    | rechazan, que es justamente lo que exige el enunciado.
    */
    it('rechaza toda combinación que el enunciado no contempla')
        ->with([
            [RoomType::STANDARD, Accommodation::TRIPLE],
            [RoomType::STANDARD, Accommodation::QUADRUPLE],
            [RoomType::JUNIOR, Accommodation::SINGLE],
            [RoomType::JUNIOR, Accommodation::DOUBLE],
            [RoomType::SUITE, Accommodation::QUADRUPLE],
        ])
        ->expect(fn (string $type, string $accommodation): bool => resolver()->isValid($type, $accommodation))
        ->toBeFalse();
});

describe('selección de la regla', function (): void {
    it('cada regla reconoce sólo su propio tipo de habitación', function (): void {
        $standard = new StandardRoomRule;

        expect($standard->supports(RoomType::STANDARD))->toBeTrue()
            ->and($standard->supports(RoomType::JUNIOR))->toBeFalse()
            ->and($standard->supports(RoomType::SUITE))->toBeFalse();
    });

    it('falla de forma explícita ante un tipo sin regla registrada', function (): void {
        // Un tipo presente en el catálogo pero sin su clase de regla es una
        // inconsistencia del sistema. Debe detenerse de forma ruidosa, nunca
        // pasar como "no permitido" y confundirse con un error del usuario.
        resolver()->allowedFor('presidencial');
    })->throws(UnsupportedRoomTypeException::class);
});

describe('extensibilidad', function (): void {
    it('admite un tipo nuevo sin modificar las reglas existentes', function (): void {
        // Demuestra el principio Abierto/Cerrado de forma comprobable: se añade
        // un tipo implementando la interfaz, sin tocar ninguna clase ya escrita
        // ni el propio resolutor.
        $presidential = new class implements AccommodationRule
        {
            public function supports(string $roomTypeSlug): bool
            {
                return $roomTypeSlug === 'presidencial';
            }

            /** @return list<string> */
            public function allowedAccommodations(): array
            {
                return [Accommodation::SINGLE, Accommodation::DOUBLE];
            }
        };

        $extended = new AccommodationRuleResolver([
            new StandardRoomRule,
            new JuniorRoomRule,
            new SuiteRoomRule,
            $presidential,
        ]);

        expect($extended->isValid('presidencial', Accommodation::DOUBLE))->toBeTrue()
            ->and($extended->isValid('presidencial', Accommodation::TRIPLE))->toBeFalse()
            // Y las reglas originales siguen comportándose igual que antes.
            ->and($extended->allowedFor(RoomType::JUNIOR))
            ->toBe([Accommodation::TRIPLE, Accommodation::QUADRUPLE]);
    });
});
