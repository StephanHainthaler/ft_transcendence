FROM node:24-alpine3.22 AS builder
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

FROM node:24-alpine3.22 AS app
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/services/user/dist ./dist
COPY --from=builder /app/services/user/db ./db
COPY --from=builder /app/services/user/data ./data

CMD ["node", "dist/services/user/src/index.js"]
