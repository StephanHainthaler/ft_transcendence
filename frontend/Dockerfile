FROM node:25-alpine3.22 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install --loglevel=error

COPY frontend /app/frontend

COPY shared ./shared

WORKDIR /app/frontend/
RUN npm install
RUN npm run build

FROM node:25-alpine3.22 AS app
WORKDIR /app

RUN apk add --no-cache openssl && \
    mkdir -p /app/certs && \
    openssl req -x509 -newkey rsa:2048 \
      -keyout /app/certs/server.key \
      -out /app/certs/server.crt \
      -days 365 -nodes \
      -subj '/CN=localhost'

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/frontend/build ./build
COPY frontend/https-server.js ./

CMD ["node", "https-server.js"]
