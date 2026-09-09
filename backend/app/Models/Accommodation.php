<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\AccommodationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Acomodación del catálogo: Sencilla, Doble, Triple o Cuádruple.
 *
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property int $capacity
 * @property int $sort_order
 */
class Accommodation extends Model
{
    /** @use HasFactory<AccommodationFactory> */
    use HasFactory;

    /**
     * Identificadores estables de las acomodaciones definidas por el enunciado.
     */
    public const SINGLE = 'sencilla';

    public const DOUBLE = 'doble';

    public const TRIPLE = 'triple';

    public const QUADRUPLE = 'cuadruple';

    protected $fillable = [
        'name',
        'slug',
        'capacity',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'capacity' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    /**
     * Tipos de habitación que admiten esta acomodación.
     *
     * @return BelongsToMany<RoomType, $this>
     */
    public function roomTypes(): BelongsToMany
    {
        return $this->belongsToMany(
            RoomType::class,
            'room_type_accommodation',
            'accommodation_id',
            'room_type_id'
        );
    }

    /**
     * Configuraciones de hotel que usan esta acomodación.
     *
     * @return HasMany<HotelRoom, $this>
     */
    public function hotelRooms(): HasMany
    {
        return $this->hasMany(HotelRoom::class);
    }
}
