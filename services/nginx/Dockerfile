FROM node:24-alpine3.22 AS builder

WORKDIR /app

COPY ./package*.json ./
COPY ./frontend/package*.json ./frontend/

RUN npm install

COPY ./frontend ./frontend/
COPY ./shared ./shared

WORKDIR /app/frontend

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/frontend/dist/ /usr/share/nginx/html/

COPY ./services/nginx/nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]
