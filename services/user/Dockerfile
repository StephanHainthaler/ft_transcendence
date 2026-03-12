FROM node:25-alpine3.22 AS builder
WORKDIR /app

COPY package*.json ./
COPY services/user/package*.json ./services/user/
COPY services/shared-server/package*.json ./services/shared-server/
RUN npm install

COPY shared ./shared
COPY services/shared-server ./services/shared-server
COPY services/user ./services/user

WORKDIR /app/services/user

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
COPY --from=builder /app/services/user/dist ./dist
COPY --from=builder /app/services/user/db ./db
COPY --from=builder /app/services/user/data ./data

CMD ["node", "dist/services/user/src/index.js"]
