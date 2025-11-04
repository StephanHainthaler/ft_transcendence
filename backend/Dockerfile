FROM node:24-alpine3.22 AS builder

WORKDIR /app

COPY ./backend/package*.json ./backend/tsconfig.json ./
COPY ./backend/src ./src
COPY ./shared ../shared

RUN npm ci
RUN npm run build

FROM node:24-alpine

WORKDIR /app

COPY ./backend/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
EXPOSE 3000

CMD ["node", "dist/app/src/index.js"]
