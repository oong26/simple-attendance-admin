# ==========================================
# Stage 1: Install Dependencies & Build
# ==========================================
FROM php:8.2-fpm AS build

RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    unzip \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd pdo_mysql zip pcntl

COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

WORKDIR /app

# Composer dependencies
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Copy all files
COPY . .

RUN composer dump-autoload --optimize --no-dev

# Create a temporary environment file so Laravel can boot during the build process
RUN cp .env.example .env \
    && sed -i 's/DB_CONNECTION=.*/DB_CONNECTION=sqlite/g' .env \
    && touch database/database.sqlite \
    && php artisan key:generate

# NPM dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Build
RUN npm run build


# ==========================================
# Stage 2: PHP-FPM Backend (php target)
# ==========================================
FROM php:8.2-fpm AS php

RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    unzip \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/* \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd pdo_mysql zip pcntl opcache

WORKDIR /var/www/html

# OPcache setup
RUN { \
  echo 'opcache.memory_consumption=128'; \
  echo 'opcache.interned_strings_buffer=8'; \
  echo 'opcache.max_accelerated_files=10000'; \
  echo 'opcache.revalidate_freq=0'; \
  echo 'opcache.validate_timestamps=0'; \
  echo 'opcache.fast_shutdown=1'; \
  echo 'opcache.enable_cli=1'; \
} > /usr/local/etc/php/conf.d/opcache-optimized.ini

# Copy project files from context
COPY . .
# Copy built artifacts from build stage
COPY --from=build /app/vendor ./vendor
COPY --from=build /app/public/build ./public/build

RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker/docker-entrypoint-php.sh /usr/local/bin/docker-entrypoint-php.sh
RUN chmod +x /usr/local/bin/docker-entrypoint-php.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint-php.sh"]

# ==========================================
# Stage 3: Web Server (nginx target)
# ==========================================
FROM nginx:alpine AS nginx

WORKDIR /var/www/html

COPY . .
COPY --from=build /app/public/build ./public/build
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8181
