FROM php:7.3-apache

ADD php.ini /usr/local/etc/php/php.ini
ADD public_html /var/www/html/

RUN mkdir -p /usr/local/etc/php/sessions
RUN chown -R www-data:www-data /usr/local/etc/php/sessions

# give access to upload files
RUN chmod -R 0755 /var/www/html  

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install unzip utility and libs needed by zip PHP extension 
RUN apt-get update && apt-get install -y \
    zlib1g-dev \
    libzip-dev \
    unzip

RUN docker-php-ext-install pdo pdo_mysql mysqli zip


# supervisor installation &&
# create directory for child images to store configuration in
RUN apt-get -y install supervisor && \
  mkdir -p /var/log/supervisor && \
  mkdir -p /etc/supervisor/conf.d
RUN mkdir /usr/api
WORKDIR /usr/api

# supervisor base configuration
ADD supervisor.conf /etc/supervisor.conf 

RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_12.x  | bash -
RUN apt-get -y install nodejs

# Build Games
WORKDIR /var/www/html/games/tic-tac-toe 
RUN rm -rf node_modules && npm install && npm run build
WORKDIR /var/www/html/games/chess
RUN rm -rf node_modules && npm install && npm run build

WORKDIR /usr/api
# default command
CMD ["supervisord", "-c", "/etc/supervisor.conf"]