FROM node:10

# Create app directory
WORKDIR /usr/src/server

# Bundle app source
COPY server/ .
RUN rm -rf node_modules && npm install


ENTRYPOINT node server.js 8080 $GAME_PORT
