# syntax=docker/dockerfile:1.7
FROM node:22.20.0-alpine3.22 AS build

WORKDIR /app
COPY . .

RUN if [ -f package-lock.json ]; then npm ci; else npm install --package-lock=false; fi
RUN npm run build:web
RUN npm prune --omit=dev --workspaces --include-workspace-root

FROM node:22.20.0-alpine3.22 AS runtime

ENV NODE_ENV=production
ENV PORT=8080

RUN apk upgrade --no-cache \
 && addgroup -S app -g 10001 \
 && adduser -S app -G app -u 10001

WORKDIR /app

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/apps/web ./apps/web
COPY --from=build /app/node_modules ./node_modules

RUN chown -R 10001:10001 /app \
 && rm -rf /root/.npm

USER 10001:10001

EXPOSE 8080
STOPSIGNAL SIGTERM

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1

CMD ["node", "node_modules/next/dist/bin/next", "start", "apps/web", "-p", "8080"]
