<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Accommodation;
use App\Models\City;
use App\Models\Hotel;
use App\Models\HotelRoom;
use App\Models\RoomType;
use Illuminate\Database\Seeder;

/**
 * Datos de demostración.
 *
 * El primer hotel reproduce exactamente el ejemplo del enunciado, incluidos su
 * NIT, sus 42 habitaciones y las tres configuraciones que allí aparecen. Así,
 * quien evalúe la prueba encuentra al abrir la aplicación el mismo caso que
 * acaba de leer en el documento, y puede comprobar de un vistazo que las
 * cuentas cuadran.
 *
 * Los demás hoteles cubren situaciones distintas —uno completo al 100 %, uno
 * sin configurar— para que la interfaz pueda evaluarse en varios estados sin
 * tener que crearlos a mano.
 */
final class HotelSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedEnunciadoExample();
        $this->seedAdditionalHotels();
    }

    /**
     * Hotel del ejemplo del enunciado:
     *
     *   Nombre: DECAMERON CARTAGENA   Dirección: CALLE 23 58-25
     *   Ciudad: CARTAGENA             NIT: 12345678-9
     *   Número de Hab: 42
     *
     *   25  ESTANDAR  SENCILLA
     *   12  JUNIOR    TRIPLE
     *    5  ESTANDAR  DOBLE
     */
    private function seedEnunciadoExample(): void
    {
        $hotel = $this->createHotel(
            name: 'Decameron Cartagena',
            address: 'Calle 23 58-25',
            cityName: 'Cartagena',
            nit: '12345678-9',
            maxRooms: 42,
            // Sector de Bocagrande, donde se concentra la oferta hotelera.
            coordinates: [10.4017, -75.5537],
        );

        $this->configureRooms($hotel, [
            [25, RoomType::STANDARD, Accommodation::SINGLE],
            [12, RoomType::JUNIOR, Accommodation::TRIPLE],
            [5, RoomType::STANDARD, Accommodation::DOUBLE],
        ]);
    }

    private function seedAdditionalHotels(): void
    {
        // Hotel con la capacidad completamente asignada: sirve para comprobar
        // que la interfaz impide añadir más habitaciones cuando no quedan.
        $sanAndres = $this->createHotel(
            name: 'Decameron San Luis',
            address: 'Carretera San Luis Km 8',
            cityName: 'San Andrés',
            nit: '900123456-7',
            maxRooms: 60,
            coordinates: [12.5275, -81.7198],
        );

        $this->configureRooms($sanAndres, [
            [20, RoomType::STANDARD, Accommodation::DOUBLE],
            [15, RoomType::JUNIOR, Accommodation::QUADRUPLE],
            [15, RoomType::SUITE, Accommodation::TRIPLE],
            [10, RoomType::SUITE, Accommodation::SINGLE],
        ]);

        // Hotel con capacidad parcialmente usada.
        $santaMarta = $this->createHotel(
            name: 'Decameron Galeón',
            address: 'Vía Ciénaga Km 12',
            cityName: 'Santa Marta',
            nit: '830987654-3',
            maxRooms: 80,
            coordinates: [11.1047, -74.2154],
        );

        $this->configureRooms($santaMarta, [
            [30, RoomType::STANDARD, Accommodation::DOUBLE],
            [12, RoomType::SUITE, Accommodation::DOUBLE],
        ]);

        // Hotel sin configurar: permite ver el estado vacío de la interfaz.
        $this->createHotel(
            name: 'Decameron Barú',
            address: 'Playa Blanca, Isla Barú',
            cityName: 'Cartagena',
            nit: '901456789-1',
            maxRooms: 120,
            coordinates: [10.2333, -75.5833],
        );
    }

    /**
     * Crea o actualiza un hotel identificándolo por su NIT.
     *
     * @param  array{0: float, 1: float}|null  $coordinates  Latitud y longitud,
     *                                                       o `null` si se desconocen.
     */
    private function createHotel(
        string $name,
        string $address,
        string $cityName,
        string $nit,
        int $maxRooms,
        ?array $coordinates = null,
    ): Hotel {
        $city = City::query()->where('name', $cityName)->firstOrFail();

        return Hotel::query()->updateOrCreate(
            ['nit' => $nit],
            [
                'name' => $name,
                'address' => $address,
                'city_id' => $city->id,
                'max_rooms' => $maxRooms,
                'latitude' => $coordinates[0] ?? null,
                'longitude' => $coordinates[1] ?? null,
            ],
        );
    }

    /**
     * Asigna configuraciones de habitación a un hotel.
     *
     * Escribe directamente contra el modelo y no a través de
     * `RoomAssignmentService` de forma deliberada: los datos aquí son fijos y
     * ya se sabe que respetan las reglas, y pasar por el servicio obligaría al
     * seeder a manejar excepciones de dominio. Las combinaciones elegidas son
     * válidas según el enunciado y las cantidades no superan el máximo de cada
     * hotel; las pruebas automatizadas verifican que así sea.
     *
     * @param  list<array{0: int, 1: string, 2: string}>  $configurations
     *                                                                     Tripletas de cantidad, slug de tipo y slug de acomodación.
     */
    private function configureRooms(Hotel $hotel, array $configurations): void
    {
        $roomTypes = RoomType::query()->pluck('id', 'slug');
        $accommodations = Accommodation::query()->pluck('id', 'slug');

        foreach ($configurations as [$quantity, $typeSlug, $accommodationSlug]) {
            HotelRoom::query()->updateOrCreate(
                [
                    'hotel_id' => $hotel->id,
                    'room_type_id' => $roomTypes[$typeSlug],
                    'accommodation_id' => $accommodations[$accommodationSlug],
                ],
                ['quantity' => $quantity],
            );
        }
    }
}
