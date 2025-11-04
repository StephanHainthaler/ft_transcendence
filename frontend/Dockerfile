FROM node:24-alpine3.22 AS builder

WORKDIR /app

COPY ./frontend/index.html ./
COPY ./frontend/package*.json ./
COPY ./frontend/vite.config.ts ./
COPY ./frontend/tsconfig.json ./

COPY ./frontend/src ./src
COPY ./frontend/public ./public

COPY ./shared ../shared

RUN npm ci
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./frontend/nginx/nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]
