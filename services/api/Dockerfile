FROM node:24-alpine3.22 AS builder

WORKDIR /app

COPY ./backend/api/package*.json ./backend/api/tsconfig.json ./
COPY ./backend/api/src ./src
COPY ./shared ../shared

RUN npm ci
RUN npm run build

FROM node:24-alpine

WORKDIR /app

COPY ./backend/api/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/app/src/index.js"]
