<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Tipo de habitación del catálogo: Estándar, Junior o Suite.
 *
 * @property int    $id
 * @property string $name
 * @property string $slug
 * @property int    $sort_order
 */
class RoomType extends Model
{
    /** @use HasFactory<\Database\Factories\RoomTypeFactory> */
    use HasFactory;

    /**
     * Identificadores estables de los tipos definidos por el enunciado.
     *
     * Se exponen como constantes para que la lógica de negocio y las pruebas
     * no dependan de literales dispersos por el código.
     */
    public const STANDARD = 'estandar';

    public const JUNIOR = 'junior';

    public const SUITE = 'suite';

    protected $fillable = [
        'name',
        'slug',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    /**
     * Acomodaciones permitidas para este tipo de habitación.
     *
     * Es la materialización en datos de la regla del enunciado; el frontend la
     * consume para ofrecer únicamente opciones válidas.
     *
     * @return BelongsToMany<Accommodation, $this>
     */
    public function accommodations(): BelongsToMany
    {
        return $this->belongsToMany(
            Accommodation::class,
            'room_type_accommodation',
            'room_type_id',
            'accommodation_id'
        )->orderBy('accommodations.sort_order');
    }

    /**
     * Configuraciones de hotel que usan este tipo de habitación.
     *
     * @return HasMany<HotelRoom, $this>
     */
    public function hotelRooms(): HasMany
    {
        return $this->hasMany(HotelRoom::class);
    }

    /**
     * Indica si este tipo admite la acomodación dada.
     *
     * Consulta la relación ya cargada cuando existe, para no disparar una
     * consulta por cada verificación dentro de un bucle.
     */
    public function allows(Accommodation $accommodation): bool
    {
        return $this->accommodations
            ->contains(fn (Accommodation $allowed): bool => $allowed->id === $accommodation->id);
    }
}
