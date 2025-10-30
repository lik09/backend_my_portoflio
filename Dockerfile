# ------------------------------
# Stage 1: Build React (inside Laravel)
# ------------------------------
FROM node:20-bullseye AS node_builder

WORKDIR /app

# Copy only package files first
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy all Laravel + React source code
COPY . .

# Build React (Vite)
RUN npm run build

# ------------------------------
# Stage 2: Build PHP / Laravel backend
# ------------------------------
FROM php:8.2-cli-bullseye AS php_builder

WORKDIR /var/www/html

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    zip \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy Laravel backend + built assets
COPY --from=node_builder /app ./

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# ------------------------------
# Stage 3: Runtime image
# ------------------------------
FROM php:8.2-cli-bullseye

WORKDIR /var/www/html

# Copy from php_builder
COPY --from=php_builder /var/www/html ./

# Expose port
EXPOSE 8080

# Laravel app key & permissions (optional)
RUN php artisan key:generate || true
RUN chmod -R 777 storage bootstrap/cache

# Run Laravel development server on Render’s $PORT
CMD php artisan serve --host=0.0.0.0 --port=$PORT
