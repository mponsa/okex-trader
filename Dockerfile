    FROM node:latest
    WORKDIR /usr/trx-reader
    COPY package.json .
    RUN npm install && npm install tsc -g
    COPY . .
    CMD ["npm", "start"]