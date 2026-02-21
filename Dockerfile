# ==========================================
# Stage 1: Build Frontend Assets (Node.js)
# ==========================================
FROM node:20 AS vite
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ==========================================
# Stage 2: Install PHP Dependencies (Composer)
# ==========================================
FROM composer:2.7 AS composer
WORKDIR /app
COPY composer.json composer.lock ./
# Install no-dev dependencies efficiently
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist
COPY . .
RUN composer dump-autoload --optimize --no-dev

# ==========================================
# Stage 3: Final Production Image (PHP Apache)
# ==========================================
FROM php:8.2-apache

# Install required system packages and PHP extensions
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    unzip \
    && rm -rf /var/lib/apt/lists/* \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd pdo_mysql zip pcntl

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Change Apache document root to Laravel's public directory
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

WORKDIR /var/www/html

# Copy project files
COPY . .

# Copy built frontend assets from Vite stage
COPY --from=vite /app/public/build ./public/build

# Copy vendor directory from Composer stage
COPY --from=composer /app/vendor ./vendor

# Set permissions for storage and bootstrap/cache
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Expose standard port 80 (will be mapped in docker-compose)
EXPOSE 80

# Run Apache in the foreground
CMD ["apache2-foreground"]
