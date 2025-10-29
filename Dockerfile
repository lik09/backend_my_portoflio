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
COPY ./backend ./backend
WORKDIR /app/backend

# Build React
RUN npm run build

# ------------------------------
# Stage 2: Build PHP / Laravel backend
# ------------------------------
FROM php:8.2-fpm-bullseye AS php_builder

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

# Copy Laravel backend + React build
COPY --from=node_builder /app/backend ./

# Install PHP dependencies
WORKDIR /var/www/html
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --optimize-autoloader

# ------------------------------
# Stage 3: Runtime image
# ------------------------------
FROM php:8.2-fpm-bullseye

WORKDIR /var/www/html

# Copy everything from php_builder
COPY --from=php_builder /var/www/html ./

# Expose port 9000 for PHP-FPM
EXPOSE 9000

CMD ["php-fpm"]
