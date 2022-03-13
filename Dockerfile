FROM node:14

WORKDIR /assetter

COPY bin/ ./bin/
COPY src/ ./src/
COPY package*.json ./
COPY index.js ./
COPY assetter.js ./

RUN npm ci

ENTRYPOINT ["node", "assetter.js"]
