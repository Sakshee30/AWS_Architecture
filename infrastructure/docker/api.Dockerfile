# syntax=docker/dockerfile:1.7
FROM node:22.20.0-alpine3.22 AS build
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install --package-lock=false; fi
COPY . .
RUN npm run build --if-present

FROM node:22.20.0-alpine3.22 AS runtime
ENV NODE_ENV=production
RUN apk upgrade --no-cache && addgroup -S app -g 10001 && adduser -S app -G app -u 10001
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/apps/api ./apps/api
COPY --from=build /app/packages ./packages
COPY --from=build /app/services ./services
COPY --from=build /app/adapters ./adapters
RUN npm install --omit=dev --workspaces --include-workspace-root --ignore-scripts --no-audit --no-fund \
 && npm cache clean --force \
 && rm -rf /root/.npm /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
RUN chown -R 10001:10001 /app
USER 10001:10001
EXPOSE 8080
STOPSIGNAL SIGTERM
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD wget -qO- http://127.0.0.1:8080/health/live || exit 1
CMD ["node","apps/api/src/server.js"]
