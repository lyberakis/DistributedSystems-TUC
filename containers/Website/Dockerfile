 
FROM php:7.3-apache

# RUN cd ~
# RUN curl -sS https://getcomposer.org/installer -o composer-setup.php

RUN docker-php-ext-install pdo pdo_mysql mysqli
# RUN composer require nmred/kafka-php