# Stage 0: build frontend with Node + npm
FROM node:22 AS build-stage

WORKDIR /app/frontend

COPY frontend/package.json ./package.json

RUN npm install

COPY ./frontend ./

ARG VITE_API_URL

RUN npm run build


# Stage 1: serve compiled app with Nginx
FROM nginx:1

COPY --from=build-stage /app/frontend/dist/ /usr/share/nginx/html

COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./frontend/nginx-backend-not-found.conf /etc/nginx/extra-conf.d/backend-not-found.conf