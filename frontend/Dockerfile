FROM node:25-alpine3.22 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm update
RUN npm install

COPY frontend /app/frontend

COPY shared ./shared

WORKDIR /app/frontend/
RUN npm install
RUN npm run build

FROM node:25-alpine3.22 AS app
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/frontend/build ./build

CMD ["node", "build"]
