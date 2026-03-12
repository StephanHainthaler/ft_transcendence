FROM node:25-alpine3.22 AS builder
WORKDIR /app

COPY package*.json ./
COPY services/auth/package*.json ./services/auth/
COPY services/shared-server/package*.json ./services/shared-server/
RUN npm install

COPY shared ./shared
COPY services/shared-server ./services/shared-server
COPY services/auth ./services/auth

WORKDIR /app/services/auth
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
COPY --from=builder /app/services/auth/dist ./dist
COPY --from=builder /app/services/auth/db ./db

CMD ["node", "dist/services/auth/src/index.js"]
