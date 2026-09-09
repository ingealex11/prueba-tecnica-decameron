<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Hotel de la compañía, con sus datos básicos y tributarios.
 *
 * @property int         $id
 * @property string      $name
 * @property string      $address
 * @property int         $city_id
 * @property string      $nit
 * @property int         $max_rooms
 * @property-read City   $city
 * @property-read \Illuminate\Database\Eloquent\Collection<int, HotelRoom> $rooms
 */
class Hotel extends Model
{
    /** @use HasFactory<\Database\Factories\HotelFactory> */
    use HasFactory;

    use SoftDeletes;

    protected $fillable = [
        'name',
        'address',
        'city_id',
        'nit',
        'max_rooms',
    ];

    protected function casts(): array
    {
        return [
            'max_rooms' => 'integer',
            'city_id' => 'integer',
        ];
    }

    /**
     * Ciudad donde se ubica el hotel.
     *
     * @return BelongsTo<City, $this>
     */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /**
     * Configuraciones de habitación del hotel.
     *
     * @return HasMany<HotelRoom, $this>
     */
    public function rooms(): HasMany
    {
        return $this->hasMany(HotelRoom::class);
    }

    /**
     * Número de habitaciones ya configuradas.
     *
     * Prefiere el agregado precargado con `withSum` cuando está disponible,
     * para que listar N hoteles no dispare N consultas adicionales.
     */
    public function occupiedRooms(): int
    {
        if (array_key_exists('rooms_sum_quantity', $this->attributes)) {
            return (int) $this->attributes['rooms_sum_quantity'];
        }

        if ($this->relationLoaded('rooms')) {
            return (int) $this->rooms->sum('quantity');
        }

        return (int) $this->rooms()->sum('quantity');
    }

    /**
     * Habitaciones que aún pueden configurarse sin superar el máximo.
     *
     * Nunca devuelve un número negativo: si por cualquier motivo el ocupado
     * superara el máximo, la respuesta correcta para el usuario es "cero
     * disponibles", no una cifra negativa sin sentido.
     */
    public function availableRooms(): int
    {
        return max(0, $this->max_rooms - $this->occupiedRooms());
    }

    /**
     * Filtra por coincidencia parcial en nombre o NIT, sin distinguir
     * mayúsculas.
     *
     * Usa ILIKE, que es específico de PostgreSQL y evita tener que aplicar
     * LOWER() sobre la columna, cosa que anularía el uso de índices.
     *
     * @param  Builder<Hotel>  $query
     * @return Builder<Hotel>
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (blank($term)) {
            return $query;
        }

        $pattern = '%'.trim($term).'%';

        return $query->where(function (Builder $inner) use ($pattern): void {
            $inner->where('name', 'ILIKE', $pattern)
                ->orWhere('nit', 'ILIKE', $pattern);
        });
    }

    /**
     * Filtra los hoteles de una ciudad concreta.
     *
     * @param  Builder<Hotel>  $query
     * @return Builder<Hotel>
     */
    public function scopeInCity(Builder $query, ?int $cityId): Builder
    {
        return blank($cityId) ? $query : $query->where('city_id', $cityId);
    }
}
