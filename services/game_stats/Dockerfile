FROM node:24-alpine3.22 AS builder
WORKDIR /app

COPY package*.json ./
COPY services/game_stats/package*.json ./services/game_stats/
COPY services/shared-server/package*.json ./services/shared-server/
RUN npm install

COPY shared ./shared
COPY services/shared-server ./services/shared-server
COPY services/game_stats ./services/game_stats

WORKDIR /app/services/game_stats
RUN npm run build

FROM node:24-alpine3.22 AS app
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/services/game_stats/dist ./dist
COPY --from=builder /app/services/game_stats/db ./db

CMD ["node", "dist/services/game_stats/src/index.js"]
# CMD ["tail", "-f"]
