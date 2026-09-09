<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Configuración de habitaciones de un hotel: cuántas habitaciones tiene de un
 * tipo y una acomodación determinados.
 *
 * @property int                 $id
 * @property int                 $hotel_id
 * @property int                 $room_type_id
 * @property int                 $accommodation_id
 * @property int                 $quantity
 * @property-read Hotel          $hotel
 * @property-read RoomType       $roomType
 * @property-read Accommodation  $accommodation
 */
class HotelRoom extends Model
{
    /** @use HasFactory<\Database\Factories\HotelRoomFactory> */
    use HasFactory;

    protected $fillable = [
        'hotel_id',
        'room_type_id',
        'accommodation_id',
        'quantity',
    ];

    protected function casts(): array
    {
        return [
            'hotel_id' => 'integer',
            'room_type_id' => 'integer',
            'accommodation_id' => 'integer',
            'quantity' => 'integer',
        ];
    }

    /**
     * Hotel al que pertenece la configuración.
     *
     * @return BelongsTo<Hotel, $this>
     */
    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    /**
     * Tipo de habitación configurado.
     *
     * @return BelongsTo<RoomType, $this>
     */
    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }

    /**
     * Acomodación configurada.
     *
     * @return BelongsTo<Accommodation, $this>
     */
    public function accommodation(): BelongsTo
    {
        return $this->belongsTo(Accommodation::class);
    }
}
