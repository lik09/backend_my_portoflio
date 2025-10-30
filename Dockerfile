# Stage 1: Node build
FROM node:20-bullseye AS node_builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: PHP build
FROM php:8.2-cli-bullseye AS php_builder
WORKDIR /var/www/html
RUN apt-get update && apt-get install -y git unzip zip curl libpng-dev libonig-dev libxml2-dev libzip-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
COPY --from=node_builder /app ./ 
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --optimize-autoloader

# Stage 3: Runtime
FROM php:8.2-cli-bullseye
WORKDIR /var/www/html
COPY --from=php_builder /var/www/html ./
EXPOSE 8080
RUN php artisan key:generate || true
RUN chmod -R 777 storage bootstrap/cache
# CMD php artisan serve --host=0.0.0.0 --port=$PORT
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8080"]

