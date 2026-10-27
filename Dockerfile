# Builds the Angular app and the NestJS API into one small image.
# The API serves the UI; data (SQLite file + uploads) lives in DATA_DIR (/data).
FROM node:22-bookworm-slim AS build
WORKDIR /app
# Build tools for the SQLite driver when no prebuilt binary exists for the platform (e.g. arm64).
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json .npmrc ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
# The shared package compiles itself on install (prepare), so it needs its sources now.
COPY packages/shared/ packages/shared/
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3210 DATA_DIR=/data
COPY package.json package-lock.json .npmrc ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/prepare.mjs packages/shared/
COPY --from=build /app/packages/shared/dist packages/shared/dist
# Runtime dependencies only, without install scripts (no compilers here); the SQLite driver's
# compiled binary is taken from the build stage, which used the same base image.
RUN npm ci --omit=dev --ignore-scripts --workspace api --workspace @emidb/shared \
  && npm cache clean --force
COPY --from=build /app/node_modules/better-sqlite3/build node_modules/better-sqlite3/build
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/api/drizzle apps/api/drizzle
COPY --from=build /app/apps/web/dist apps/web/dist
VOLUME ["/data"]
EXPOSE 3210
CMD ["node", "apps/api/dist/main.js"]
