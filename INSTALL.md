# Guía de instalación paso a paso

Esta guía está escrita para seguirse sin conocimientos previos. Cada paso
explica **qué** hay que escribir, **dónde** hay que escribirlo y **qué debería
verse** si salió bien.

Si algo no coincide con lo que aquí se describe, vaya a
[Si algo sale mal](#si-algo-sale-mal) al final del documento.

> ⏱️ **Tiempo aproximado:** 20 minutos, la mayor parte esperando descargas.

---

## Índice

1. [Qué necesita instalar](#1-qué-necesita-instalar)
2. [Descargar el proyecto](#2-descargar-el-proyecto)
3. [Crear la base de datos](#3-crear-la-base-de-datos)
4. [Poner en marcha el backend](#4-poner-en-marcha-el-backend)
5. [Poner en marcha el frontend](#5-poner-en-marcha-el-frontend)
6. [Comprobar que todo funciona](#6-comprobar-que-todo-funciona)
7. [Ejecutar las pruebas](#7-ejecutar-las-pruebas)
8. [Si algo sale mal](#si-algo-sale-mal)

---

## Antes de empezar: cómo abrir una terminal

Varios pasos piden «abrir una terminal». Es una ventana donde se escriben
órdenes en lugar de hacer clic.

| Sistema | Cómo abrirla |
|---------|--------------|
| **Windows** | Pulse la tecla `Windows`, escriba `powershell` y pulse `Enter` |
| **macOS** | Pulse `Cmd + Espacio`, escriba `terminal` y pulse `Enter` |
| **Linux** | Pulse `Ctrl + Alt + T` |

Para ejecutar una orden: escríbala (o péguela) y pulse `Enter`.

---

## 1. Qué necesita instalar

Hacen falta cuatro programas. Si ya tiene alguno, sáltese ese apartado.

### 1.1 PHP 8.2 o superior

El lenguaje en el que está escrito el backend.

| Sistema | Cómo instalarlo |
|---------|-----------------|
| **Windows** | Descargue [XAMPP](https://www.apachefriends.org/es/index.html) (incluye PHP) o [PHP para Windows](https://windows.php.net/download/) |
| **macOS** | En la terminal: `brew install php` |
| **Ubuntu/Debian** | `sudo apt install php8.2 php8.2-pgsql php8.2-mbstring php8.2-xml php8.2-curl` |

**Compruébelo.** Escriba en la terminal:

```bash
php --version
```

Debería aparecer algo parecido a `PHP 8.2.12`. El número después de `8.` debe
ser 2 o mayor.

> ⚠️ **Importante en Windows.** PHP necesita tener activada la extensión de
> PostgreSQL. Abra el archivo `php.ini` (en XAMPP está en `C:\xampp\php\php.ini`),
> busque estas dos líneas y quíteles el punto y coma del principio:
>
> ```ini
> ;extension=pdo_pgsql      →   extension=pdo_pgsql
> ;extension=pgsql          →   extension=pgsql
> ```
>
> Guarde el archivo. Para comprobar que funcionó:
>
> ```bash
> php -m
> ```
>
> En la lista que aparece deben figurar `pdo_pgsql` y `pgsql`.

### 1.2 Composer

El gestor que descarga las librerías del backend.

| Sistema | Cómo instalarlo |
|---------|-----------------|
| **Windows** | Descargue e instale [Composer-Setup.exe](https://getcomposer.org/Composer-Setup.exe) |
| **macOS / Linux** | `curl -sS https://getcomposer.org/installer \| php` y luego `sudo mv composer.phar /usr/local/bin/composer` |

**Compruébelo:**

```bash
composer --version
```

Debería aparecer `Composer version 2.x.x`.

### 1.3 Node.js 20 o superior

Necesario para construir la interfaz.

Descárguelo de [nodejs.org](https://nodejs.org/) eligiendo la versión **LTS**, o
en macOS con `brew install node`.

**Compruébelo:**

```bash
node --version
npm --version
```

Debería aparecer `v20.x.x` o superior, y un número de versión de npm.

### 1.4 PostgreSQL 17

La base de datos.

| Sistema | Cómo instalarlo |
|---------|-----------------|
| **Windows** | Descargue el instalador de [postgresql.org](https://www.postgresql.org/download/windows/) |
| **macOS** | `brew install postgresql@17` y después `brew services start postgresql@17` |
| **Ubuntu/Debian** | `sudo apt install postgresql-17` |

> 📝 **Anote la contraseña.** Durante la instalación en Windows se le pedirá una
> contraseña para el usuario `postgres`. Guárdela: la necesitará en el paso 3.

**Compruébelo:**

```bash
psql --version
```

Debería aparecer `psql (PostgreSQL) 17.x`.

> Si en Windows dice que la orden no existe, cierre la terminal y ábrala de
> nuevo. Si sigue sin funcionar, use la ruta completa:
> `"C:\Program Files\PostgreSQL\17\bin\psql.exe" --version`

---

## 2. Descargar el proyecto

En la terminal, sitúese donde quiera guardar el proyecto (por ejemplo, su
carpeta de documentos) y ejecute:

```bash
git clone https://github.com/ingealex11/prueba-tecnica-decameron.git
cd prueba-tecnica-decameron
```

> Si no tiene Git, puede descargar el proyecto como archivo ZIP desde el botón
> verde **Code → Download ZIP** de la página del repositorio, descomprimirlo y
> entrar en la carpeta resultante.

**Debería ver** estas carpetas al ejecutar `ls` (o `dir` en Windows):

```
backend    database    docs    frontend    INSTALL.md    README.md
```

---

## 3. Crear la base de datos

### 3.1 Crear el usuario y las bases

Ejecute, sustituyendo `postgres` por su usuario si es otro:

```bash
psql -U postgres
```

Le pedirá la contraseña que anotó en el paso 1.4. Al escribirla **no se verá
nada en pantalla**; es normal, siga escribiendo y pulse `Enter`.

Cuando aparezca el símbolo `postgres=#`, escriba estas tres órdenes, una por
una:

```sql
CREATE ROLE decameron WITH LOGIN PASSWORD 'decameron_2026' CREATEDB;
CREATE DATABASE decameron OWNER decameron ENCODING 'UTF8';
CREATE DATABASE decameron_testing OWNER decameron ENCODING 'UTF8';
```

Después escriba `\q` y pulse `Enter` para salir.

**Debería ver** `CREATE ROLE` y dos veces `CREATE DATABASE`.

### 3.2 Cargar los datos

Tiene dos opciones. **Elija sólo una.**

<details>
<summary><strong>Opción A — desde el dump (más rápida)</strong></summary>

```bash
psql -U decameron -d decameron -f database/dump/decameron_completo.sql
```

La contraseña es `decameron_2026`.

</details>

<details>
<summary><strong>Opción B — con las migraciones (recomendada si va a desarrollar)</strong></summary>

No haga nada ahora: se hará en el paso 4.4.

</details>

---

## 4. Poner en marcha el backend

### 4.1 Entrar en la carpeta

```bash
cd backend
```

### 4.2 Descargar las librerías

```bash
composer install
```

Tardará uno o dos minutos y mostrará muchas líneas. **Debería terminar** con un
mensaje sobre paquetes descubiertos, sin la palabra `error`.

### 4.3 Crear el archivo de configuración

| Sistema | Orden |
|---------|-------|
| **Windows (PowerShell)** | `Copy-Item .env.example .env` |
| **macOS / Linux** | `cp .env.example .env` |

Después genere la clave de seguridad de la aplicación:

```bash
php artisan key:generate
```

**Debería ver:** `INFO  Application key set successfully.`

> El archivo `.env` ya viene configurado para la base de datos que creó en el
> paso 3. Si eligió otra contraseña, ábralo con un editor de texto y ajuste la
> línea `DB_PASSWORD=`.

### 4.4 Crear las tablas y los datos de ejemplo

**Sáltese este paso si eligió la Opción A del punto 3.2.**

```bash
php artisan migrate --seed
```

**Debería ver** una lista de migraciones terminadas en `DONE` y, al final, tres
seeders ejecutados.

### 4.5 Arrancar el servidor

```bash
php artisan serve
```

**Debería ver:**

```
INFO  Server running on [http://127.0.0.1:8000].
```

> ⚠️ **Deje esta terminal abierta.** Si la cierra, el backend se detiene. Para
> los pasos siguientes abra una **terminal nueva**.

---

## 5. Poner en marcha el frontend

Abra una **segunda terminal** y sitúese de nuevo en la carpeta del proyecto.

### 5.1 Entrar en la carpeta

```bash
cd frontend
```

### 5.2 Descargar las librerías

```bash
npm install
```

Tardará uno o dos minutos.

### 5.3 Crear el archivo de configuración

| Sistema | Orden |
|---------|-------|
| **Windows (PowerShell)** | `Copy-Item .env.example .env` |
| **macOS / Linux** | `cp .env.example .env` |

### 5.4 Arrancar la aplicación

```bash
npm run dev
```

**Debería ver:**

```
➜  Local:   http://localhost:5173/
```

---

## 6. Comprobar que todo funciona

Abra **Chrome** o **Firefox** y visite:

### http://localhost:5173

**Debería ver** una página de presentación oscura con el título «Sistema de
gestión de hoteles y configuración de habitaciones».

Ahora recorra esta lista para confirmar que todo está en su sitio:

- [ ] Pulse **«Entrar a la aplicación»**. Aparece la pantalla de inicio de sesión.
- [ ] Pulse **«Rellenar credenciales de prueba»** y luego **«Continuar»**. Aparece la verificación en dos pasos con un mensaje simulado que contiene un código de seis dígitos.
- [ ] Pulse **«Usar este código»**. Entra al panel, con cuatro tarjetas de indicadores y un mapa con cuatro marcadores.
- [ ] En el menú lateral pulse **«Hoteles»**. «Decameron Cartagena» muestra **42 / 42** y la etiqueta **Completo**. Es el hotel del ejemplo del enunciado.
- [ ] Pulse sobre «Decameron Galeón». Se ven sus configuraciones, su ubicación en el mapa y quedan 38 libres.
- [ ] Pulse **«Asignar habitaciones»**, elija el tipo **Junior** y despliegue **Acomodación**. Sólo aparecen **Triple** y **Cuádruple**.
- [ ] Cambie el tipo a **Estándar**. Ahora sólo aparecen **Sencilla** y **Doble** (Doble bloqueada, porque ya está configurada).
- [ ] Escriba **50** en la cantidad y pulse **Asignar habitaciones**. Aparece en rojo: *sólo quedan 38 disponibles*.
- [ ] Abra <http://localhost:8000/docs/api>. Se ve la documentación interactiva de la API con 16 operaciones.

Si las nueve casillas se cumplen, la instalación está correcta y las reglas del
negocio funcionan.

> Las credenciales de demostración son `gerente@decameron.test` /
> `decameron2026`. El código de verificación se muestra en pantalla porque la
> instancia está en modo demostración (`TWO_FACTOR_REVEAL_CODE=true`); en
> producción se enviaría por SMS o correo.

---

## 7. Ejecutar las pruebas

No es necesario para usar la aplicación, pero permite verificar que todo está
bien.

### Backend

Desde la carpeta `backend`, con el servidor detenido o en otra terminal:

```bash
composer test
```

**Debería terminar con:** `Tests: 113 passed`.

### Frontend

Desde la carpeta `frontend`:

```bash
npm test
```

**Debería terminar con:** `Tests  50 passed (50)`.

### Todas las verificaciones

Lo mismo que ejecuta la integración continua:

```bash
cd backend  && composer check    # estilo, análisis estático y pruebas
cd frontend && npm run check     # estilo, tipos, pruebas y compilación
```

---

## Si algo sale mal

### «php no se reconoce como un comando»

PHP no está instalado o no está en el PATH del sistema.

- **Windows con XAMPP:** use la ruta completa `C:\xampp\php\php.exe --version`, o añada `C:\xampp\php` a la variable de entorno PATH.
- Cierre la terminal y ábrala de nuevo después de instalar cualquier programa: las terminales ya abiertas no ven las instalaciones nuevas.

### «could not find driver» al ejecutar las migraciones

Falta activar la extensión de PostgreSQL en PHP. Vuelva al aviso del
[apartado 1.1](#11-php-82-o-superior) y quite el punto y coma de las dos líneas
del `php.ini`.

Después compruébelo con:

```bash
php -r "print_r(PDO::getAvailableDrivers());"
```

En la lista debe aparecer `pgsql`.

### «Connection refused» o «could not connect to server»

PostgreSQL no está en marcha.

| Sistema | Cómo arrancarlo |
|---------|-----------------|
| **Windows** | Abra «Servicios», busque `postgresql-x64-17` y pulse «Iniciar» |
| **macOS** | `brew services start postgresql@17` |
| **Linux** | `sudo systemctl start postgresql` |

### «password authentication failed for user "decameron"»

La contraseña del archivo `.env` no coincide con la del usuario de la base de
datos. Abra `backend/.env`, busque la línea `DB_PASSWORD=` y compruebe que dice
exactamente `decameron_2026`, sin espacios ni comillas.

### La página carga pero no aparece ningún hotel

El frontend no consigue hablar con el backend.

1. Compruebe que la primera terminal, la de `php artisan serve`, sigue abierta y sin errores.
2. Abra <http://localhost:8000/api/v1/catalogs/cities> en el navegador. Debería ver texto en formato JSON con nombres de ciudades.
3. Si eso funciona pero la aplicación no, revise que `frontend/.env` contenga:
   ```
   VITE_API_URL=http://localhost:8000/api/v1
   ```
   Tras modificarlo hay que **detener y volver a arrancar** `npm run dev`: los
   archivos de entorno sólo se leen al iniciar.

### «Port 5173 is already in use»

Otro programa ocupa ese puerto. Cierre la otra ventana que esté ejecutando el
proyecto, o arránquelo en otro puerto:

```bash
npm run dev -- --port 5174
```

Si cambia el puerto, añádalo también a la lista de orígenes autorizados en
`backend/.env`:

```
CORS_ALLOWED_ORIGINS=http://localhost:5174
```

### Las pruebas del backend fallan con errores de base de datos

Falta crear la base de pruebas. Ejecute:

```bash
psql -U postgres -c "CREATE DATABASE decameron_testing OWNER decameron"
```

### Quiero empezar de cero

Esto **borra todos los datos** y vuelve a crear las tablas con los datos de
ejemplo:

```bash
cd backend
php artisan migrate:fresh --seed
```

---

## Resumen de las órdenes

Para quien ya tiene todo instalado:

```bash
# Base de datos
psql -U postgres -c "CREATE ROLE decameron WITH LOGIN PASSWORD 'decameron_2026' CREATEDB"
psql -U postgres -c "CREATE DATABASE decameron OWNER decameron"
psql -U postgres -c "CREATE DATABASE decameron_testing OWNER decameron"

# Backend  ·  terminal 1
cd backend && composer install && cp .env.example .env
php artisan key:generate && php artisan migrate --seed && php artisan serve

# Frontend  ·  terminal 2
cd frontend && npm install && cp .env.example .env && npm run dev
```

Abra <http://localhost:5173> y listo.
