# API gateway (NestJS + Prisma)

The public REST API. Handles authentication, request validation, orchestration of
the Rust inference engine + SHAP sidecar, persistence, and audit logging.

**Stack:** NestJS · **Prisma** (PostgreSQL) · JWT · class-validator · Swagger.
**Package manager:** **pnpm**.

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/auth/register` | — | Create an officer account, returns a JWT |
| `POST` | `/auth/login` | — | Log in, returns a JWT |
| `POST` | `/predict` | JWT | Decision + probability + SHAP reasons (audited) |
| `GET` | `/predict/logs` | JWT | Recent audit-log rows |
| `GET` | `/predict/logs/:id` | JWT | One audit-log row |
| `POST/GET/PUT/DELETE` | `/applicants` | JWT | Manage applicant records |
| `GET` | `/docs` | — | Swagger UI |

## `/predict` flow

1. Validate the DTO (`class-validator`).
2. **Encode** raw fields → 11-float vector via the shared feature contract.
3. Call the **Rust engine** (`/predict`) for the decision (fatal if down).
4. Call the **SHAP sidecar** (`/explain`) for reasons (non-fatal — degrades).
5. Persist a `PredictionLog` row (audit).
6. Return `{ applicationId, eligible, probability, decision, reasons, inferenceLatencyMs }`.

## Data model (Prisma)

See [`prisma/schema.prisma`](prisma/schema.prisma): `User`, `Applicant`,
`PredictionLog`. The client is generated from this single schema file.

## Local development

```bash
corepack enable                     # makes pnpm available
pnpm install
cp .env.example .env                # set DATABASE_URL, JWT_SECRET, service URLs
pnpm prisma generate                # generate the typed client
pnpm prisma db push                 # create the tables (needs a running Postgres)
pnpm start:dev                      # http://localhost:3000  (docs at /docs)
```

## Tests

```bash
pnpm test                           # unit tests (feature-contract encoding, etc.)
```

## Docker

The image runs `prisma db push` on startup (idempotent) then `node dist/main`,
so the schema is in sync without a separate migration step. Configuration is via
the environment (see `.env.example` and `docker-compose.yml`).

## Environment

| Var | Meaning |
|-----|---------|
| `PORT` | Listen port (default 3000) |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | JWT signing |
| `DATABASE_URL` | Postgres connection string (Prisma) |
| `INFERENCE_URL` | Rust engine base URL |
| `SHAP_URL` | SHAP sidecar base URL |
| `FEATURE_CONTRACT_PATH` | Override the feature-contract location |
