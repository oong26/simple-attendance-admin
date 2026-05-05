#!/bin/sh
set -e

# If DB envs not set, skip waiting
: "${DB_HOST:=}"
: "${DB_PORT:=3306}"

if [ -n "$DB_HOST" ]; then
  echo "Waiting for DB ${DB_HOST}:${DB_PORT}..."
  retry=0
  until nc -z "$DB_HOST" "$DB_PORT" || [ $retry -eq 30 ]; do
    echo "Waiting for database..."
    retry=$((retry+1))
    sleep 1
  done

  if [ $retry -ge 30 ]; then
    echo "WARNING: DB did not become ready after 30s — continuing (you may want to fail instead)."
  else
    echo "DB is reachable."
  fi
fi

# Ensure APP_KEY exists
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:" ]; then
  echo "Generating APP_KEY..."
  php artisan key:generate --ansi --force || true
fi

# Ensure storage symlink exists
if [ ! -L public/storage ]; then
  echo "Creating storage symlink..."
  php artisan storage:link --force || true
fi

# Clear old caches and rebuild (safe now; will run even if DB not fully ready)
php artisan config:clear || true
php artisan cache:clear || true
php artisan config:cache || true

# Optimizing laravel
echo "Caching Laravel for Production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations if MIGRATE=true
if [ "${MIGRATE:-true}" = "true" ]; then
    echo "Running migrations..."
    php artisan migrate --force || true
fi

if [ "${MIGRATE_SEED:-false}" = "true" ]; then
    echo "Seeding DB..."
    php artisan db:seed --force || true
fi

# if [ "${NPM_BUILD:-false}" = "true" ]; then
#     echo "Build NPM Assets..."
#     npm run build || true
# fi

# Ensure permissions (optional)
chown -R www-data:www-data storage bootstrap/cache public/storage || true

# Launch php-fpm (PID 1)
exec php-fpm
