# Loan Eligibility Prediction System

A production-grade, **explainable**, polyglot loan-eligibility decision service.

> **Python** trains the model → exported to **ONNX** → served by a **Rust** inference
> engine → orchestrated by a **NestJS** API gateway → audited in **PostgreSQL**,
> with **SHAP** explanations for regulatory compliance.

```
                          ┌──────────────────────────────────────────┐
                          │            NestJS API gateway             │
   Client ──HTTP/JWT──▶   │  validate → encode (feature contract)     │
                          │  orchestrate ──┬──▶ Rust engine (ONNX)     │ → decision + probability
                          │                └──▶ SHAP sidecar (Python)  │ → reasons
                          │  persist ─────────▶ PostgreSQL             │ → audit log
                          └──────────────────────────────────────────┘
```

## Why polyglot?

Each tier uses the best tool for its job, joined by two stable contracts (a JSON
feature contract and an ONNX model file):

| Layer | Tech | Folder | Port | Responsibility |
|-------|------|--------|------|----------------|
| ML pipeline | Python (sklearn · XGBoost · imbalanced-learn · SHAP) | [`ml/`](ml/) | — | Train, evaluate, export the model |
| Model bridge | ONNX | `ml/artifacts/model.onnx` | — | Portable, language-agnostic model |
| Inference engine | Rust (axum + `ort`) | [`inference-engine/`](inference-engine/) | 8081 | Fast, sub-100 ms predictions |
| Explainability | Python (FastAPI + SHAP) | [`shap-service/`](shap-service/) | 8000 | Per-decision "reasons" |
| API gateway | NestJS (Prisma + JWT) | [`api-gateway/`](api-gateway/) | 3000 | Auth, validation, orchestration, audit |
| Database | PostgreSQL | (docker) | 5432 | Users, applicants, audit log |

The **single source of truth** for feature order/encoding is
[`shared/feature-contract.json`](shared/feature-contract.json), read by all three
services so an applicant is encoded identically everywhere.

## Repository layout

```
loan-eligibility-system/
├── shared/feature-contract.json   # single source of truth (feature order + encoding)
├── ml/                            # Python: train → evaluate → export ONNX
├── inference-engine/              # Rust: loads model.onnx, serves /predict
├── shap-service/                  # Python FastAPI: SHAP TreeExplainer sidecar
├── api-gateway/                   # NestJS + Prisma: public REST API + audit log
├── docker-compose.yml             # one-command bring-up of the whole system
└── Makefile                       # train / export / up / down helpers
```

## Quick start

### Option A — full system with Docker (recommended)

```bash
# from the repo root
make export          # copy model.onnx + xgb_model.json into the services
docker compose up --build
```

This starts PostgreSQL, the Rust engine, the SHAP sidecar, and the gateway.
Only the gateway (`:3000`) is exposed publicly.

### Option B — train the model yourself first

```bash
cd ml
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd src
python train.py        # trains 5 models, writes artifacts/
python evaluate.py     # comparison table + plots
python export_onnx.py  # model.onnx + parity check (expect 30/30)
```

Then run **Option A** to serve it.

## Using the API

```bash
# 1. register + login
curl -s -XPOST localhost:3000/auth/register -H 'Content-Type: application/json' \
  -d '{"email":"officer@bank.ng","password":"password123"}'

TOKEN=$(curl -s -XPOST localhost:3000/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"officer@bank.ng","password":"password123"}' | jq -r .access_token)

# 2. predict
curl -s -XPOST localhost:3000/predict -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{
    "Gender":"Male","Married":"Yes","Dependents":"0","Education":"Graduate",
    "Self_Employed":"Yes","ApplicantIncome":3000,"CoapplicantIncome":0,
    "LoanAmount":66,"Loan_Amount_Term":360,"Credit_History":1,"Property_Area":"Urban"}'
```

Response:

```json
{
  "applicationId": "8f3c…",
  "eligible": true,
  "probability": 0.8692,
  "decision": "APPROVED",
  "reasons": [
    "Credit History (good) increased approval likelihood",
    "Married = 1 increased approval likelihood",
    "Loan Amount = 66 increased approval likelihood"
  ],
  "inferenceLatencyMs": 1.2
}
```

Interactive API docs (Swagger): <http://localhost:3000/docs>

## Key engineering decisions

- **Tree model on raw features.** The deployed XGBoost runs on unscaled,
  contract-ordered features. Trees are scale-invariant and live requests have no
  missing values, so no scaler/imputer is needed in the inference path — which
  also lets the model export to ONNX cleanly.
- **`ort` over `tract`.** `ort` (ONNX Runtime) fully supports the tree-ensemble
  ops XGBoost emits; `tract`'s support is partial.
- **SHAP as a sidecar.** There is no production-grade SHAP in Rust, so a thin
  Python service reuses the *exact* XGBoost model — explanations stay faithful.
- **Prisma 7 + pnpm in the gateway.** Type-safe data access with a declarative
  schema; Prisma 7's `prisma-client` generator emits a CommonJS client (so
  NestJS stays on CommonJS) and connects through the `pg` driver adapter. pnpm
  for fast, disk-efficient installs.
- **Graceful degradation.** If the SHAP sidecar is down, the gateway still
  returns the decision (without reasons) rather than failing the request.

## Documentation

Each service has its own README:

- [ml/README.md](ml/README.md) — training pipeline
- [inference-engine/README.md](inference-engine/README.md) — Rust engine
- [shap-service/README.md](shap-service/README.md) — SHAP sidecar
- [api-gateway/README.md](api-gateway/README.md) — NestJS gateway

## License

MIT — see [LICENSE](LICENSE).
