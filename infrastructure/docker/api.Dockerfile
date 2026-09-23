# syntax=docker/dockerfile:1.7
FROM node:22.11.0-alpine3.20 AS deps
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install --package-lock=false; fi

FROM node:22.11.0-alpine3.20 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --if-present
RUN npm prune --omit=dev

FROM node:22.11.0-alpine3.20 AS runtime
ENV NODE_ENV=production
RUN addgroup -S app -g 10001 && adduser -S app -G app -u 10001
WORKDIR /app
COPY --from=build --chown=10001:10001 /app ./
USER 10001:10001
EXPOSE 8080
STOPSIGNAL SIGTERM
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD wget -qO- http://127.0.0.1:8080/health/live || exit 1
CMD ["npm","run","start:api"]
