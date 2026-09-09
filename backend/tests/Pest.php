<?php

declare(strict_types=1);

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Configuración de la suite de pruebas
|--------------------------------------------------------------------------
|
| Las pruebas se dividen en dos suites con propósitos distintos:
|
|   - Unit: verifican reglas de negocio en aislamiento, con dobles en lugar de
|     dependencias reales. No tocan la base de datos y por tanto se ejecutan en
|     milisegundos, lo que las hace útiles durante el desarrollo.
|
|   - Feature: recorren el sistema completo desde la petición HTTP hasta
|     PostgreSQL. Son las que demuestran que las piezas encajan.
|
| Sólo las de Feature reciben RefreshDatabase: pagar el coste de migrar la base
| en cada prueba unitaria sería desperdiciarlo, ya que no la usan.
|
*/

pest()->extend(TestCase::class)
    ->in('Unit');

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');
