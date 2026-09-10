<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Desafío de segundo factor pendiente de resolver.
 *
 * @property string $id
 * @property int $user_id
 * @property string $code_hash
 * @property int $attempts
 * @property Carbon $expires_at
 * @property Carbon|null $consumed_at
 */
class TwoFactorChallenge extends Model
{
    use HasUuids;

    /** Intentos fallidos que se toleran antes de invalidar el desafío. */
    public const MAX_ATTEMPTS = 5;

    /** Minutos que el código sigue siendo válido desde su emisión. */
    public const TTL_MINUTES = 5;

    protected $fillable = [
        'user_id',
        'code_hash',
        'attempts',
        'expires_at',
        'consumed_at',
    ];

    protected function casts(): array
    {
        return [
            'attempts' => 'integer',
            'expires_at' => 'datetime',
            'consumed_at' => 'datetime',
        ];
    }

    /**
     * Usuario que está autenticándose.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Indica si el desafío aún puede resolverse.
     *
     * Se comprueban las tres condiciones juntas para que ningún llamador pueda
     * olvidarse de una: no caducado, no consumido y con intentos disponibles.
     */
    public function isPending(): bool
    {
        return $this->consumed_at === null
            && $this->expires_at->isFuture()
            && $this->attempts < self::MAX_ATTEMPTS;
    }

    /** Segundos que faltan para que caduque; nunca negativo. */
    public function secondsRemaining(): int
    {
        return max(0, (int) now()->diffInSeconds($this->expires_at, false));
    }

    /** Intentos que quedan antes de invalidar el desafío. */
    public function attemptsRemaining(): int
    {
        return max(0, self::MAX_ATTEMPTS - $this->attempts);
    }
}
