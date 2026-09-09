# Product Backlog — Sistema de Gestión Hotelera Decameron

> Documento de trabajo del equipo. Refleja cómo se planificó y ejecutó la prueba
> bajo un marco SCRUM adaptado a un equipo de una persona y dos sprints cortos.

## Visión del producto

> **Para** el Gerente de Operaciones Hoteleras de Hoteles Decameron Colombia,
> **que** necesita mantener el inventario de hoteles de la compañía y la
> configuración de habitaciones de cada uno,
> **el** Sistema de Gestión Hotelera **es una** aplicación web
> **que** permite registrar hoteles con sus datos tributarios y asignarles tipos
> de habitación y acomodaciones respetando las reglas del negocio,
> **a diferencia de** las hojas de cálculo que se usan hoy,
> **nuestro producto** impide por diseño configuraciones inválidas y excesos de
> capacidad, en lugar de detectarlos después.

## Roles

| Rol | Responsable |
|---|---|
| Product Owner | Gerente de Operaciones Hoteleras (representado por el enunciado de la prueba) |
| Scrum Master / Development Team | Desarrollador candidato |

## Definition of Ready

Una historia entra al sprint sólo si:

- [x] Está escrita en formato *Como… quiero… para…*
- [x] Tiene criterios de aceptación verificables y sin ambigüedad
- [x] Está estimada en puntos de historia (Fibonacci)
- [x] Sus dependencias están resueltas o planificadas antes

## Definition of Done

Una historia se considera terminada sólo si cumple **todo** lo siguiente:

- [x] El código implementa todos sus criterios de aceptación
- [x] Existen pruebas unitarias y de integración que los cubren, y pasan
- [x] El pipeline de CI está en verde (estilo, análisis estático, pruebas, build)
- [x] El código está documentado (PHPDoc / TSDoc en la API pública)
- [x] Cumple los principios SOLID; no introduce deuda técnica conocida
- [x] La interfaz es responsive y verificada en 1280×800 y 1440×900
- [x] Funciona en Chrome y Firefox
- [x] Está mergeada a `main` con Conventional Commits

## Épicas

| ID | Épica | Descripción |
|---|---|---|
| E1 | Gestión de Hoteles | Alta, consulta, edición y baja del inventario de hoteles |
| E2 | Configuración de Habitaciones | Asignación de tipos y acomodaciones con reglas de negocio |
| E3 | Calidad y Entrega | Pruebas, integración continua, documentación y despliegue |
| E4 | Experiencia de Usuario | Landing explicativa y diseño responsive |

---

## Sprint 1 — Fundación y Dominio

**Objetivo del sprint:** disponer de una API REST funcional que haga cumplir
todas las reglas de negocio del enunciado, con cobertura de pruebas.

### HU-01 · Registrar un hotel — `E1` · 5 pts

> **Como** gerente de operaciones
> **quiero** registrar un hotel con su nombre, dirección, ciudad, NIT y número
> máximo de habitaciones
> **para** mantener actualizado el inventario de la compañía.

**Criterios de aceptación**

- **Dado** que envío los datos completos y válidos, **cuando** creo el hotel,
  **entonces** se guarda y recibo `201` con el hotel creado.
- **Dado** que ya existe un hotel con el mismo nombre, **cuando** intento
  crearlo, **entonces** recibo `422` con un mensaje claro y no se duplica.
- **Dado** que ya existe un hotel con el mismo NIT, **cuando** intento crearlo,
  **entonces** recibo `422` y no se duplica.
- **Dado** que el número de habitaciones es cero o negativo, **cuando** creo el
  hotel, **entonces** recibo `422`.
- **Dado** que omito un campo obligatorio, **cuando** creo el hotel, **entonces**
  recibo `422` con el detalle por campo.

### HU-02 · Consultar hoteles — `E1` · 3 pts

> **Como** gerente de operaciones
> **quiero** ver el listado de hoteles con búsqueda, filtro por ciudad y
> paginación
> **para** encontrar rápidamente un hotel en un inventario grande.

**Criterios de aceptación**

- El listado devuelve los hoteles paginados con metadatos de paginación.
- Puedo buscar por nombre o NIT de forma parcial e insensible a mayúsculas.
- Puedo filtrar por ciudad.
- Cada hotel muestra habitaciones ocupadas y disponibles sobre su máximo.
- Consultar un hotel inexistente devuelve `404`.

### HU-03 · Editar y eliminar un hotel — `E1` · 3 pts

> **Como** gerente de operaciones
> **quiero** corregir los datos de un hotel o darlo de baja
> **para** mantener la información fiel a la realidad.

**Criterios de aceptación**

- Al editar, las reglas de unicidad se evalúan excluyendo el propio registro.
- **Dado** que reduzco el máximo de habitaciones por debajo de lo ya
  configurado, **cuando** guardo, **entonces** recibo `422` explicando el
  conflicto.
- Al eliminar un hotel, sus configuraciones de habitación se eliminan con él.
- El borrado es lógico (*soft delete*) para conservar trazabilidad.

### HU-04 · Consultar catálogos — `E2` · 2 pts

> **Como** aplicación cliente
> **quiero** obtener las ciudades, los tipos de habitación y las acomodaciones
> válidas para cada tipo
> **para** poblar los formularios sin codificar valores fijos en el front.

**Criterios de aceptación**

- `GET /catalogs/cities` devuelve las ciudades ordenadas alfabéticamente.
- `GET /catalogs/room-types` devuelve cada tipo con sus acomodaciones permitidas.
- Los catálogos son de sólo lectura: no existe ningún endpoint de escritura.

### HU-05 · Asignar habitaciones respetando el tipo — `E2` · 8 pts

> **Como** gerente de operaciones
> **quiero** asignar a un hotel una cantidad de habitaciones de un tipo y una
> acomodación
> **para** reflejar la configuración real del inmueble.

**Criterios de aceptación**

- **Dado** el tipo *Estándar*, **entonces** sólo se aceptan *Sencilla* o *Doble*.
- **Dado** el tipo *Junior*, **entonces** sólo se aceptan *Triple* o *Cuádruple*.
- **Dado** el tipo *Suite*, **entonces** sólo se aceptan *Sencilla*, *Doble* o
  *Triple*.
- Cualquier otra combinación devuelve `422` indicando las opciones válidas.
- **Dado** que la combinación tipo+acomodación ya existe en ese hotel,
  **entonces** recibo `409` y no se duplica.
- **Dado** que la suma de habitaciones superaría el máximo del hotel,
  **entonces** recibo `422` indicando cuántas quedan disponibles.
- Dos peticiones simultáneas nunca pueden superar el máximo del hotel.

### HU-06 · Editar y quitar configuraciones — `E2` · 5 pts

> **Como** gerente de operaciones
> **quiero** modificar la cantidad de una configuración o eliminarla
> **para** ajustar la distribución sin rehacer todo el hotel.

**Criterios de aceptación**

- Al cambiar la cantidad, se revalida la capacidad total del hotel.
- Al eliminar una configuración, la capacidad ocupada se libera.
- Editar una configuración inexistente devuelve `404`.

---

## Sprint 2 — Interfaz, Calidad y Entrega

**Objetivo del sprint:** entregar una interfaz responsive que consuma la API, con
integración continua verde y desplegada en la nube.

### HU-07 · Interfaz de gestión de hoteles — `E4` · 8 pts

> **Como** gerente de operaciones
> **quiero** administrar los hoteles desde una interfaz web clara
> **para** trabajar sin conocer la API.

**Criterios de aceptación**

- Listado con búsqueda, filtro por ciudad y paginación.
- Formularios de alta y edición con validación en cliente equivalente a la del
  servidor.
- Los errores del servidor se muestran asociados a su campo.
- La eliminación pide confirmación explícita.
- Estados de carga, vacío y error resueltos visualmente.

### HU-08 · Interfaz de configuración de habitaciones — `E4` · 8 pts

> **Como** gerente de operaciones
> **quiero** configurar las habitaciones de un hotel desde la interfaz
> **para** ver en todo momento cuántas llevo y cuántas me quedan.

**Criterios de aceptación**

- Al elegir un tipo de habitación, el selector de acomodación muestra **sólo**
  las válidas para ese tipo.
- Un indicador visible muestra ocupadas / disponibles / máximo.
- Las acomodaciones ya configuradas se deshabilitan para evitar duplicados.
- Las reglas violadas se explican en lenguaje del negocio, no técnico.

### HU-09 · Diseño responsive — `E4` · 5 pts

> **Como** gerente que trabaja en un portátil de 13 o 15 pulgadas
> **quiero** que la aplicación se adapte a mi pantalla
> **para** usarla sin desplazamiento horizontal ni recortes.

**Criterios de aceptación**

- Verificado sin desplazamiento horizontal en 1280×800 (13") y 1440×900 (15").
- Funciona además en tablet y móvil por progresión natural del diseño.
- Verificado en Chrome y en Firefox.

### HU-10 · Landing explicativa — `E4` · 5 pts

> **Como** evaluador técnico
> **quiero** una página que explique el proyecto, su arquitectura y sus
> decisiones
> **para** entender el trabajo sin leer todo el código.

**Criterios de aceptación**

- Explica el problema, el stack, la arquitectura, los patrones, la seguridad y la
  persistencia.
- Incluye los diagramas del proyecto.
- Un botón lleva a la aplicación funcional.

### HU-11 · Pruebas automatizadas — `E3` · 8 pts

> **Como** equipo de desarrollo
> **queremos** pruebas unitarias y de integración
> **para** cambiar el código con la certeza de no romper reglas del negocio.

**Criterios de aceptación**

- Cada regla de negocio del enunciado tiene al menos una prueba unitaria.
- Cada endpoint tiene pruebas de integración de éxito y de fallo.
- El front tiene pruebas de sus componentes y hooks clave.
- Se genera reporte de cobertura.

### HU-12 · Integración continua — `E3` · 5 pts

> **Como** equipo de desarrollo
> **queremos** que cada cambio se verifique automáticamente
> **para** que `main` esté siempre en estado desplegable.

**Criterios de aceptación**

- El pipeline corre en cada `push` y `pull request`.
- Verifica estilo, análisis estático, pruebas y build en back y front.
- Un fallo impide el merge; el estado es visible con badges en el README.

### HU-13 · Despliegue y documentación — `E3` · 5 pts

> **Como** evaluador
> **quiero** una aplicación en línea y una guía de instalación
> **para** probarla sin configurar nada, o reproducirla localmente si quiero.

**Criterios de aceptación**

- Front y API desplegados y accesibles por HTTPS.
- Guía paso a paso pensada para alguien sin experiencia previa.
- Dump de la base de datos listo para restaurar.
- Diagramas UML incluidos en el repositorio.

---

## Resumen de esfuerzo

| Sprint | Historias | Puntos |
|---|---|---|
| Sprint 1 — Fundación y Dominio | HU-01 … HU-06 | 26 |
| Sprint 2 — Interfaz, Calidad y Entrega | HU-07 … HU-13 | 44 |
| **Total** | **13 historias** | **70** |

## Trazabilidad con el enunciado

Cada criterio de aceptación del PDF tiene una historia que lo cubre:

| Criterio del enunciado | Historia |
|---|---|
| La cantidad de habitaciones no debe superar el máximo por hotel | HU-05, HU-06 |
| No deben existir hoteles repetidos | HU-01, HU-03 |
| No deben existir tipos y acomodaciones repetidos por hotel | HU-05 |
| No se requieren administradores de catálogos | HU-04 |
| Los gerentes usan portátiles de 13 y 15 pulgadas | HU-09 |
| La aplicación debe ser totalmente RESTful | HU-01 … HU-06 |
| Back y front desacoplados | HU-07, HU-08 |
| Backend en PHP | Sprint 1 completo |
| Base de datos PostgreSQL | HU-01, HU-13 |
| Documentación y diagramas UML | HU-10, HU-13 |
| Despliegue en la nube con link | HU-13 |
| Repositorio Git público | HU-12, HU-13 |
| Navegadores Firefox y Chrome | HU-09 |
| Buenas prácticas: patrones, SOLID, documentación | Transversal (Definition of Done) |
