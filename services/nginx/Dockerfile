# FROM node:24-alpine3.22 AS builder
#
# WORKDIR /app
#
# COPY ./package*.json ./
# COPY ./frontend/package*.json ./frontend/
#
# RUN npm install
#
# COPY ./frontend ./frontend/
# COPY ./shared ./shared
#
# WORKDIR /app/frontend
#
# RUN npm run build
#
FROM nginx:alpine

RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/certs && \
    openssl req -x509 -newkey rsa:2048 \
      -keyout /etc/nginx/certs/server.key \
      -out /etc/nginx/certs/server.crt \
      -days 365 -nodes \
      -subj '/CN=localhost'

COPY services/nginx/nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]
