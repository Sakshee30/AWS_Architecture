# syntax=docker/dockerfile:1.7
FROM node:22.11.0-alpine3.20 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22.11.0-alpine3.20 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --if-present

FROM nginx:1.27.3-alpine3.20 AS runtime
RUN addgroup -S app -g 10001 && adduser -S app -G app -u 10001
COPY --from=build /app/dist /usr/share/nginx/html
COPY infrastructure/docker/nginx.conf /etc/nginx/conf.d/default.conf
RUN chown -R 10001:10001 /usr/share/nginx/html /var/cache/nginx /var/run /etc/nginx/conf.d
USER 10001:10001
EXPOSE 8080
STOPSIGNAL SIGTERM
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
CMD ["nginx","-g","daemon off;"]
