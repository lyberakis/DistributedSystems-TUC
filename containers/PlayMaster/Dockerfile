FROM node:10

# Create app directory
WORKDIR /usr/src/server

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# COPY package*.json ./

# RUN npm ci --only=production
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY server/ .


EXPOSE 8080
EXPOSE 1337

ENTRYPOINT node server.js 8080 1337
