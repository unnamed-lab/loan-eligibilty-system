# syntax=docker/dockerfile:1
FROM node:22-slim AS builder
WORKDIR /app
RUN corepack enable \
    && apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml .npmrc ./
# Cache mount keeps the pnpm store across builds, so retries on a flaky network
# resume from already-downloaded packages instead of starting over.
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --store-dir=/pnpm/store --frozen-lockfile=false
COPY prisma.config.ts ./
COPY prisma ./prisma
# generate loads prisma.config.ts, which requires DATABASE_URL to resolve
# (it does not connect — a placeholder is fine; the real URL is set at runtime).
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public"
RUN pnpm prisma generate            # emits src/generated/prisma (CJS client)
COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN pnpm run build                  # compiles src (incl. generated client) -> dist

FROM node:22-slim
WORKDIR /app
RUN corepack enable \
    && apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --prod --store-dir=/pnpm/store --frozen-lockfile=false
COPY prisma.config.ts ./
COPY prisma ./prisma
COPY --from=builder /app/dist ./dist
EXPOSE 3000
# At runtime, DATABASE_URL is injected by docker-compose. Push the schema
# (idempotent) then start the server.
CMD ["sh", "-c", "pnpm prisma db push && node dist/main"]
