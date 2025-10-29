# Use an official PHP image with Composer and Node.js installed
FROM richarvey/nginx-php-fpm:latest

# Set working directory
WORKDIR /var/www/html

# Copy everything into container
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader && \
    npm install && \
    npm run build && \
    php artisan key:generate && \
    php artisan storage:link

# Expose port
EXPOSE 10000

# Start Laravel's built-in server
CMD php artisan serve --host=0.0.0.0 --port=10000
