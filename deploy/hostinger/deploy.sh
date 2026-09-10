#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# Despliegue del backend en Hostinger Cloud (hosting compartido con SSH).
#
# Se ejecuta EN EL SERVIDOR, por SSH, desde la carpeta raíz del repositorio.
# Es idempotente: puede lanzarse tantas veces como se quiera; cada ejecución
# trae el último código de GitHub, instala dependencias, aplica migraciones
# pendientes y recompila la caché de configuración.
#
#   ssh -p 65002 uXXXX@servidor
#   cd ~/domains/<dominio>/app && bash deploy/hostinger/deploy.sh
#
# Requisitos en el servidor: git, composer y PHP 8.2+ con pdo_pgsql activo
# (se activa desde hPanel → Sitio web → PHP → Configuración → Extensiones).
# -----------------------------------------------------------------------------
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKEND="$ROOT/backend"

log() { printf '\n\033[1;34m▸ %s\033[0m\n' "$*"; }

log "Actualizando el código desde GitHub"
git -C "$ROOT" fetch --quiet origin main
git -C "$ROOT" reset --quiet --hard origin/main

log "Comprobando PHP y la extensión de PostgreSQL"
php -v | head -1
php -m | grep -qi '^pdo_pgsql$' || {
  echo "✗ Falta pdo_pgsql. Actívela en hPanel → PHP → Configuración → Extensiones y vuelva a ejecutar." >&2
  exit 1
}

cd "$BACKEND"

if [ ! -f .env ]; then
  echo "✗ No existe backend/.env. Cree uno a partir de .env.production.example y rellene los valores de Neon." >&2
  exit 1
fi

log "Instalando dependencias de producción"
composer install --no-dev --prefer-dist --no-interaction --no-progress --optimize-autoloader

if ! grep -q '^APP_KEY=.\+' .env; then
  log "Generando la clave de la aplicación"
  php artisan key:generate --force
fi

log "Aplicando migraciones pendientes"
php artisan migrate --force

# Los catálogos son idempotentes; los hoteles de demostración sólo se cargan
# si la base está vacía, para no pisar datos reales en despliegues sucesivos.
if [ "$(php artisan tinker --execute='echo \App\Models\Hotel::count();' 2>/dev/null | tail -1)" = "0" ]; then
  log "Base vacía: cargando catálogos y datos de demostración"
  php artisan db:seed --force
else
  log "Refrescando catálogos"
  php artisan db:seed --class=CitySeeder --force
  php artisan db:seed --class=CatalogSeeder --force
fi

log "Recompilando cachés de producción"
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

log "Permisos de escritura para storage y bootstrap/cache"
chmod -R ug+rwX storage bootstrap/cache

log "Comprobación final"
php artisan about --only=environment | head -8

printf '\n\033[1;32m✓ Backend desplegado.\033[0m\n'
