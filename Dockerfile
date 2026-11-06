# Vetra as one image: the API and the built web, in a single process, with nothing else to install.
# Postgres and WAHA are their own services, in compose.yaml.

# ---- build: the whole workspace, compiled
FROM node:24-alpine AS build
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /repo

COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# The web calls the API by a relative address, so the same build works on any port.
ENV VITE_API_URL=/api
RUN pnpm --filter ./apps/api build && pnpm --filter ./apps/web build

# ---- run: only what was built. The server is one file with everything bundled in it.
FROM node:24-alpine AS run
# The version comes from the tag that published the image, and the app and the update (VET-24) read it from here.
ARG VETRA_VERSION=dev
LABEL org.opencontainers.image.title="Vetra" \
      org.opencontainers.image.source="https://github.com/DevVynx/vetra-crm" \
      org.opencontainers.image.licenses="PolyForm-Shield-1.0.0" \
      org.opencontainers.image.version="${VETRA_VERSION}"
ENV VETRA_VERSION=${VETRA_VERSION} \
    NODE_ENV=production \
    API_HOST=0.0.0.0 \
    WEB_DIST_DIR=/app/web \
    MIGRATIONS_DIR=/app/migrations \
    AUTO_MIGRATE=true \
    STORAGE_DIR=/data/storage
WORKDIR /app

COPY --from=build /repo/apps/api/dist/server.js ./server.js
COPY --from=build /repo/apps/web/dist ./web
COPY --from=build /repo/packages/database/migrations ./migrations
# The license goes with every copy of the software, the image included.
COPY --from=build /repo/LICENSE ./LICENSE

# What Vetra keeps as files (the profile photo) lives here, in a volume that outlives the container.
RUN mkdir -p /data/storage && chown -R node:node /data
USER node

CMD ["node", "server.js"]
