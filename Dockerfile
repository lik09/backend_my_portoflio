# =========================
# Stage 1: Build React App
# =========================
FROM node:20-bullseye AS node_builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (avoid Rollup optional deps issue)
RUN npm install --legacy-peer-deps

# Copy React source files
COPY . .

# Build the React app
RUN npm run build

# =========================
# Stage 2: Build Laravel App
# =========================
FROM php:8.2-fpm-bullseye AS php_builder

# Install system dependencies and PHP extensions
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
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /var/www/html

# Copy Laravel files (repo root)
COPY . ./

# Copy built React files from stage 1 into Laravel public folder
COPY --from=node_builder /app/dist ./public

# Set permissions (optional)
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# =========================
# Stage 3: Final Image
# =========================
FROM php:8.2-fpm-bullseye

WORKDIR /var/www/html

# Copy Laravel + React build from php_builder stage
COPY --from=php_builder /var/www/html ./

# Expose port for PHP-FPM
EXPOSE 9000

# Start PHP-FPM
CMD ["php-fpm"]
