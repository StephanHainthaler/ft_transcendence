FROM node:24-alpine3.22 AS builder

WORKDIR /app

COPY ./frontend/index.html ./
COPY ./frontend/vite.config.ts ./
COPY ./frontend/tsconfig.json ./
COPY ./frontend/tailwind.config.js ./

COPY ./frontend/src ./src
COPY ./frontend/public ./public
COPY ./package*.json ./

COPY ./shared ../shared

RUN npm ci
RUN npx tailwindcss -o ./styles.css -i ./src/app.css
RUN npm run build:docker:frontend

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/styles.css /usr/share/nginx/html/
COPY ./services/nginx/nginx.conf /etc/nginx/nginx.conf
# COPY ./services/nginx/index.html /usr/share/nginx/html/

CMD ["nginx", "-g", "daemon off;"]
