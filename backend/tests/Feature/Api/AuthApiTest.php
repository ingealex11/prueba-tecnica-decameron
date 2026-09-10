<?php

declare(strict_types=1);

use App\Models\TwoFactorChallenge;
use App\Models\User;
use Illuminate\Routing\Middleware\ThrottleRequests;

/*
|--------------------------------------------------------------------------
| Autenticación en dos pasos
|--------------------------------------------------------------------------
|
| Verifican que saber la contraseña no basta para entrar: hace falta además
| resolver el desafío de segundo factor, y ese desafío caduca, se consume al
| usarse y se invalida tras varios intentos fallidos.
|
| El límite de peticiones se desactiva en estas pruebas de forma explícita:
| existe para frenar a quien pruebe contraseñas a ciegas, y aquí lo que se
| quiere ejercitar es la lógica del flujo, no la cuota.
|
*/

beforeEach(function (): void {
    $this->withoutMiddleware(ThrottleRequests::class);

    $this->user = User::factory()->create([
        'name' => 'Gerente de Operaciones',
        'email' => 'gerente@decameron.test',
        'password' => 'decameron2026',
    ]);
});

/** Realiza el primer paso y devuelve el desafío emitido. */
function beginLogin(string $email = 'gerente@decameron.test', string $password = 'decameron2026')
{
    return test()->postJson('/api/v1/auth/login', compact('email', 'password'));
}

describe('paso 1 · credenciales', function (): void {
    it('emite un desafío sin entregar todavía ningún token', function (): void {
        $response = beginLogin()
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['challenge_id', 'expires_in', 'sent_to', 'demo_code']]);

        // Lo esencial del segundo factor: la contraseña correcta no abre sesión.
        expect($response->json('data'))->not->toHaveKey('token');

        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->assertDatabaseCount('two_factor_challenges', 1);
    });

    it('rechaza una contraseña incorrecta', function (): void {
        beginLogin(password: 'incorrecta')
            ->assertStatus(401)
            ->assertJsonPath('error_code', 'INVALID_CREDENTIALS');

        $this->assertDatabaseCount('two_factor_challenges', 0);
    });

    it('responde igual ante un correo inexistente que ante una contraseña errónea', function (): void {
        // Distinguirlos revelaría qué cuentas existen en el sistema.
        $unknown = beginLogin(email: 'nadie@decameron.test')->assertStatus(401);
        $wrongPassword = beginLogin(password: 'incorrecta')->assertStatus(401);

        expect($unknown->json('message'))->toBe($wrongPassword->json('message'));
    });

    it('enmascara el destino del código', function (): void {
        beginLogin()->assertJsonPath('data.sent_to', 'ge•••••@decameron.test');
    });

    it('guarda el código cifrado, nunca en claro', function (): void {
        $code = beginLogin()->json('data.demo_code');
        $challenge = TwoFactorChallenge::query()->firstOrFail();

        expect($challenge->code_hash)->not->toBe($code)
            ->and(password_verify($code, $challenge->code_hash))->toBeTrue();
    });

    it('invalida el desafío anterior al iniciar sesión de nuevo', function (): void {
        $first = beginLogin()->json('data.challenge_id');
        beginLogin();

        // Sólo el más reciente sigue vivo; el anterior no puede resolverse.
        $this->assertDatabaseCount('two_factor_challenges', 1);
        $this->assertDatabaseMissing('two_factor_challenges', ['id' => $first]);
    });

    it('no revela el código cuando el modo demostración está apagado', function (): void {
        config(['hotel.two_factor.reveal_code' => false]);

        beginLogin()->assertJsonPath('data.demo_code', null);
    });
});

describe('paso 2 · código de verificación', function (): void {
    it('abre la sesión con el código correcto', function (): void {
        $issued = beginLogin()->json('data');

        $this->postJson('/api/v1/auth/verify', [
            'challenge_id' => $issued['challenge_id'],
            'code' => $issued['demo_code'],
            'device_name' => 'Portátil de pruebas',
        ])
            ->assertOk()
            ->assertJsonPath('data.token_type', 'Bearer')
            ->assertJsonPath('data.user.email', 'gerente@decameron.test')
            ->assertJsonPath('data.user.initials', 'GO')
            ->assertJsonStructure(['data' => ['token']]);

        $this->assertDatabaseHas('personal_access_tokens', ['name' => 'Portátil de pruebas']);
    });

    it('rechaza un código equivocado e informa los intentos restantes', function (): void {
        $issued = beginLogin()->json('data');

        $this->postJson('/api/v1/auth/verify', [
            'challenge_id' => $issued['challenge_id'],
            'code' => '000000',
        ])
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'INVALID_TWO_FACTOR_CODE')
            ->assertJsonPath('meta.attempts_remaining', TwoFactorChallenge::MAX_ATTEMPTS - 1);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    });

    it('invalida el desafío al agotar los intentos', function (): void {
        $issued = beginLogin()->json('data');

        foreach (range(1, TwoFactorChallenge::MAX_ATTEMPTS) as $_) {
            $this->postJson('/api/v1/auth/verify', [
                'challenge_id' => $issued['challenge_id'],
                'code' => '000000',
            ]);
        }

        // Ni siquiera el código correcto sirve ya: seis dígitos se adivinan en
        // minutos si se permite probar sin límite.
        $this->postJson('/api/v1/auth/verify', [
            'challenge_id' => $issued['challenge_id'],
            'code' => $issued['demo_code'],
        ])->assertStatus(401);
    });

    it('no acepta un código ya utilizado', function (): void {
        $issued = beginLogin()->json('data');
        $payload = ['challenge_id' => $issued['challenge_id'], 'code' => $issued['demo_code']];

        $this->postJson('/api/v1/auth/verify', $payload)->assertOk();

        $this->postJson('/api/v1/auth/verify', $payload)
            ->assertStatus(401)
            ->assertJsonPath('error_code', 'INVALID_CHALLENGE');
    });

    it('rechaza un código caducado', function (): void {
        $issued = beginLogin()->json('data');

        $this->travel(TwoFactorChallenge::TTL_MINUTES + 1)->minutes();

        $this->postJson('/api/v1/auth/verify', [
            'challenge_id' => $issued['challenge_id'],
            'code' => $issued['demo_code'],
        ])
            ->assertStatus(401)
            ->assertJsonPath('error_code', 'CHALLENGE_EXPIRED');
    });

    it('rechaza un desafío inexistente', function (): void {
        $this->postJson('/api/v1/auth/verify', [
            'challenge_id' => '00000000-0000-0000-0000-000000000000',
            'code' => '123456',
        ])->assertStatus(401);
    });

    it('exige exactamente seis dígitos sin consumir intentos', function (): void {
        $issued = beginLogin()->json('data');

        $this->postJson('/api/v1/auth/verify', [
            'challenge_id' => $issued['challenge_id'],
            'code' => '12ab',
        ])->assertStatus(422)
            ->assertJsonValidationErrors('code');

        // Un formato inválido se rechaza antes de comparar, así que no cuenta
        // como intento fallido.
        expect(TwoFactorChallenge::query()->firstOrFail()->attempts)->toBe(0);
    });
});

describe('sesión', function (): void {
    /** Completa el inicio de sesión y devuelve el token. */
    function loginAndGetToken(): string
    {
        $issued = beginLogin()->json('data');

        return test()->postJson('/api/v1/auth/verify', [
            'challenge_id' => $issued['challenge_id'],
            'code' => $issued['demo_code'],
        ])->json('data.token');
    }

    it('devuelve la persona autenticada con su token', function (): void {
        $token = loginAndGetToken();

        $this->withToken($token)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'gerente@decameron.test');
    });

    it('rechaza consultar la sesión sin token', function (): void {
        $this->getJson('/api/v1/auth/me')
            ->assertStatus(401)
            ->assertJsonPath('error_code', 'UNAUTHENTICATED');
    });

    it('cierra sesión revocando sólo el token actual', function (): void {
        $portatil = loginAndGetToken();
        $movil = loginAndGetToken();

        $this->withToken($portatil)->postJson('/api/v1/auth/logout')->assertNoContent();

        // El guard de autenticación cachea la persona resuelta durante toda la
        // prueba, así que sin descartarlo la segunda petición seguiría viendo
        // al usuario del token ya revocado. En una petición HTTP real cada una
        // arranca con el guard vacío; esto sólo reproduce esa condición.
        $this->app['auth']->forgetGuards();

        // El portátil ya no entra; el móvil sigue con su sesión abierta.
        $this->withToken($portatil)->getJson('/api/v1/auth/me')->assertStatus(401);

        $this->app['auth']->forgetGuards();

        $this->withToken($movil)->getJson('/api/v1/auth/me')->assertOk();
    });
});
