# ------------------------------
# Stage 1: Build React (Vite)
# ------------------------------
FROM node:20-bullseye AS node_builder
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install Node dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build React/Vite assets
RUN npm run build

# ------------------------------
# Stage 2: Build PHP / Laravel
# ------------------------------
FROM php:8.2-cli-bullseye AS php_builder
WORKDIR /var/www/html

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git unzip zip curl libpng-dev libonig-dev libxml2-dev libzip-dev default-mysql-client \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy Laravel + built React assets
COPY --from=node_builder /app ./

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# ------------------------------
# Stage 3: Runtime
# ------------------------------
FROM php:8.2-cli-bullseye
WORKDIR /var/www/html

COPY --from=php_builder /var/www/html ./

# Expose port
EXPOSE 8080

# Set permissions
# RUN php artisan key:generate || true
RUN php artisan config:cache

RUN chmod -R 775 storage bootstrap/cache

# Use JSON form CMD (best practice)
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8080"]
