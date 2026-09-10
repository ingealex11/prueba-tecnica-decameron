# Despliegue en Hostinger Cloud + Neon

Guía del despliegue real de esta instancia. Complementa a
[INSTALL.md](../../INSTALL.md), que cubre la ejecución en un equipo local.

## Arquitectura del despliegue

```
decameron.<dominio>         → Hostinger · carpeta estática con el build de React
api-decameron.<dominio>     → Hostinger · Laravel (PHP 8.2, LiteSpeed)
                               │
                               └── Neon · PostgreSQL 17 gestionado, TLS obligatorio
```

**Por qué Neon y no la base de Hostinger.** El plan Cloud Startup ofrece
MySQL/MariaDB, pero el enunciado exige PostgreSQL. Neon ofrece PostgreSQL
gestionado con capa gratuita permanente y sin tarjeta, y Laravel se conecta
desde Hostinger con la extensión `pdo_pgsql`, que hPanel permite activar.

## 1. Base de datos en Neon

1. Cree una cuenta en <https://neon.tech> y un proyecto (región: la más cercana a
   Hostinger; Estados Unidos este suele ser la mejor opción).
2. En el panel del proyecto copie la **cadena de conexión** con `sslmode=require`.
3. Anote host, base, usuario y contraseña: van al `.env` del backend.

## 2. Subdominios en Hostinger

En hPanel → *Sitios web* → su dominio → *Dominios* → *Subdominios*:

| Subdominio | Carpeta |
|---|---|
| `decameron` | `domains/<dominio>/public_html/decameron` (por defecto) |
| `api-decameron` | **Carpeta personalizada:** `domains/<dominio>/app/backend/public` |

La carpeta personalizada del subdominio de la API debe apuntar a `backend/public`
y no a la raíz del backend: es lo que impide que `.env` y el código queden
accesibles desde el navegador.

Active el certificado SSL gratuito para ambos subdominios (hPanel → *Seguridad*
→ *SSL*).

## 3. PHP

hPanel → *Sitios web* → su dominio → *Avanzado* → *Configuración de PHP*:

- Versión: **8.2** o superior.
- Extensiones: marque **`pdo_pgsql`** y **`pgsql`**.

## 4. Backend por SSH

hPanel → *Avanzado* → *Acceso SSH* muestra usuario, puerto y servidor.

```bash
ssh -p 65002 uXXXXXXXX@<servidor>

mkdir -p ~/domains/<dominio>/app
cd ~/domains/<dominio>/app
git clone https://github.com/ingealex11/prueba-tecnica-decameron.git .

cp backend/.env.production.example backend/.env
nano backend/.env          # rellenar dominio y credenciales de Neon

bash deploy/hostinger/deploy.sh
```

El script es idempotente: para publicar cambios futuros basta con volver a
ejecutarlo. Trae el último `main`, instala dependencias, migra y recompila las
cachés.

Compruebe: `https://api-decameron.<dominio>/api/v1/catalogs/cities` debe
devolver JSON, y `https://api-decameron.<dominio>/docs/api` la documentación.

## 5. Frontend

El frontend es estático: se compila con la URL de la API y se sube el resultado.

En su equipo:

```bash
cd frontend
echo "VITE_API_URL=https://api-decameron.<dominio>/api/v1" > .env.production
npm run build
```

Suba el contenido de `frontend/dist/` a `domains/<dominio>/public_html/decameron/`
(por SFTP, por el administrador de archivos de hPanel, o con `rsync` por SSH):

```bash
rsync -avz --delete -e "ssh -p 65002" frontend/dist/ uXXXXXXXX@<servidor>:~/domains/<dominio>/public_html/decameron/
```

El `.htaccess` incluido en el build hace que las rutas de la aplicación
(`/app/hoteles/3`, `/login`) se sirvan con `index.html` al recargar.

Compruebe: `https://decameron.<dominio>` muestra la presentación; al entrar,
el inicio de sesión funciona contra la API.

## Lista de comprobación final

- [ ] `https://decameron.<dominio>` carga la presentación
- [ ] Iniciar sesión → código en pantalla → panel con cuatro hoteles y mapa
- [ ] `https://api-decameron.<dominio>/docs/api` muestra 16 operaciones
- [ ] `https://api-decameron.<dominio>/api/v1/hotels` responde JSON
- [ ] Asignar Junior + Sencilla devuelve 422 con las opciones válidas

## Si algo falla

| Síntoma | Causa habitual |
|---|---|
| `could not find driver` | `pdo_pgsql` sin activar en la configuración de PHP del sitio |
| `SSL connection is required` | Falta `DB_SSLMODE=require` en `.env` |
| La app carga pero no hay hoteles | `CORS_ALLOWED_ORIGINS` no coincide exactamente con el origen del frontend (incluido `https://`) |
| 500 al abrir la API | Revise `backend/storage/logs/laravel.log`; casi siempre es `APP_KEY` vacío o permisos de `storage/` |
| Recargar `/app/hoteles` da 404 | Falta el `.htaccess` en la carpeta del frontend |
