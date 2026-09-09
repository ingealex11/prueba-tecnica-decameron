<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Ciudad del catálogo donde puede ubicarse un hotel.
 *
 * @property int         $id
 * @property string      $name
 * @property string|null $dane_code
 */
class City extends Model
{
    /** @use HasFactory<\Database\Factories\CityFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'dane_code',
    ];

    /**
     * Hoteles ubicados en esta ciudad.
     *
     * @return HasMany<Hotel, $this>
     */
    public function hotels(): HasMany
    {
        return $this->hasMany(Hotel::class);
    }
}
