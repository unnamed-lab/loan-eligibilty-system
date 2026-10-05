# The build context is the REPO ROOT (see docker-compose.yml and render.yaml),
# because the runtime stage bakes in shared/feature-contract.json from ../shared.
# Every COPY below is therefore prefixed with api-gateway/.
FROM node:22-slim AS builder
WORKDIR /app
RUN corepack enable \
    && apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
COPY api-gateway/package.json api-gateway/pnpm-lock.yaml* api-gateway/pnpm-workspace.yaml api-gateway/.npmrc ./
# Cache mount keeps the pnpm store across builds, so retries on a flaky network
# resume from already-downloaded packages instead of starting over.
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --store-dir=/pnpm/store --frozen-lockfile=false
COPY api-gateway/prisma.config.ts ./
COPY api-gateway/prisma ./prisma
# generate loads prisma.config.ts, which requires DATABASE_URL to resolve
# (it does not connect — a placeholder is fine; the real URL is set at runtime).
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public"
RUN pnpm prisma generate            # emits generated/prisma (CJS client)
COPY api-gateway/tsconfig.json api-gateway/nest-cli.json ./
COPY api-gateway/src ./src
RUN pnpm run build                  # compiles src -> dist

FROM node:22-slim
WORKDIR /app
RUN corepack enable \
    && apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
COPY api-gateway/package.json api-gateway/pnpm-lock.yaml* api-gateway/pnpm-workspace.yaml api-gateway/.npmrc ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --prod --store-dir=/pnpm/store --frozen-lockfile=false
COPY api-gateway/prisma.config.ts ./
COPY api-gateway/prisma ./prisma
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/dist ./dist
# src/common/feature-contract.ts reads this at import time, so a wrong path
# crashes the process at boot rather than on first request.
COPY shared/feature-contract.json /shared/feature-contract.json
ENV FEATURE_CONTRACT_PATH=/shared/feature-contract.json
EXPOSE 3000
# At runtime, DATABASE_URL is injected by docker-compose. Push the schema
# (idempotent) then start the server. Render overrides this command and runs
# `prisma db push` as a preDeployCommand instead, so replicas don't race.
CMD ["sh", "-c", "pnpm prisma db push && node dist/main"]
