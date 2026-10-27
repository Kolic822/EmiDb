# Builds the Angular app and the NestJS API into one small image.
# The API serves the UI; data (SQLite file + uploads) lives in /data.
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3210 DATA_DIR=/data
COPY --from=build /app/package.json /app/package-lock.json /app/.npmrc ./
COPY --from=build /app/apps/api/package.json apps/api/
COPY --from=build /app/apps/web/package.json apps/web/
COPY --from=build /app/packages/shared/package.json packages/shared/
RUN npm ci --omit=dev --workspace api --workspace @emidb/shared && npm cache clean --force
COPY --from=build /app/packages/shared/dist packages/shared/dist
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/api/drizzle apps/api/drizzle
COPY --from=build /app/apps/web/dist apps/web/dist
VOLUME ["/data"]
EXPOSE 3210
CMD ["node", "apps/api/dist/main.js"]
