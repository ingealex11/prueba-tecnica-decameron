<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Persona con acceso al sistema.
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $password
 */
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    // Estos atributos nunca se serializan, ni siquiera por descuido al
    // devolver el modelo directamente.
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            // El cast `hashed` cifra la contraseña al asignarla, de modo que es
            // imposible guardarla en claro aunque alguien olvide hacerlo.
            'password' => 'hashed',
        ];
    }

    /**
     * Desafíos de segundo factor de esta persona.
     *
     * @return HasMany<TwoFactorChallenge, $this>
     */
    public function twoFactorChallenges(): HasMany
    {
        return $this->hasMany(TwoFactorChallenge::class);
    }
}
