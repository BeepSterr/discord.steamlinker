FROM node:18
RUN mkdir -p /app/src/
COPY ./src /app/src/

COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json
COPY ./config.js /app/config.js

RUN cd /app/ && npm install
ENTRYPOINT export NODE_ENV=production && cd /app/ && npm run serve