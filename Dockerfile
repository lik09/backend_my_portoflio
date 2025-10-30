# ------------------------------
# Stage 1: Build React (Vite)
# ------------------------------
FROM node:20-bullseye AS node_builder

WORKDIR /app

# Copy only package files first to leverage caching
COPY package*.json ./

# Install dependencies inside Linux container
RUN npm install --legacy-peer-deps

# Copy only React assets (if your Laravel + React are separate, e.g., resources/js)
COPY resources/js ./resources/js
COPY resources/css ./resources/css

# Build React/Vite
RUN npm run build

# ------------------------------
# Stage 2: Build PHP / Laravel backend
# ------------------------------
FROM php:8.2-cli-bullseye AS php_builder

WORKDIR /var/www/html

# Install system dependencies for PHP + Laravel
RUN apt-get update && apt-get install -y \
    git unzip zip curl libpng-dev libonig-dev libxml2-dev libzip-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy Laravel backend (excluding node_modules) + built React assets
COPY --from=node_builder /app/dist ./public/build
COPY . .

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# ------------------------------
# Stage 3: Runtime image
# ------------------------------
FROM php:8.2-cli-bullseye

WORKDIR /var/www/html

# Copy built Laravel app + assets
COPY --from=php_builder /var/www/html ./

# Expose port
EXPOSE 8080

# Laravel app key & permissions
RUN php artisan key:generate || true
RUN chmod -R 777 storage bootstrap/cache

# Run Laravel development server
CMD php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
