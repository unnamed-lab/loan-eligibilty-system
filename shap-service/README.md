# SHAP explainability sidecar (Python / FastAPI)

A thin service holding the **exact deployed XGBoost model** plus a SHAP
`TreeExplainer`. It turns a prediction into the human-readable *reasons* the
gateway returns to the client — satisfying the adverse-action / explainability
requirement (a rejected applicant must be told *why*).

## Endpoints

| Method | Path | Body | Response |
|--------|------|------|----------|
| `POST` | `/explain` | `{ "features": [f32; 11] }` | `{ base_value, contributions[], top_reasons[] }` |
| `GET` | `/health` | — | `{ "status": "ok" }` |

`contributions` is the per-feature SHAP value; `top_reasons` is the 3 strongest
drivers, mapped back to feature names via the shared contract, e.g.:

```json
{ "top_reasons": ["Credit History (good) increased approval likelihood", "..."] }
```

## Why a Python sidecar (not Rust)

There is no production-grade SHAP implementation in Rust. Reusing the same
`xgb_model.json` in Python keeps the explanation faithful to the deployed model.
This is a common, defensible production pattern; the gateway **degrades
gracefully** if this service is down (it still returns the decision).

## Run locally

```bash
pip install -r requirements.txt
uvicorn app:app --port 8000
# then:
curl -s localhost:8000/explain -H 'Content-Type: application/json' \
  -d '{"features":[1,1,0,0,1,3000,0,66,360,1,2]}'
```

Needs `artifacts/xgb_model.json` (run the ML pipeline or `make export`).

## Environment

| Var | Default | Meaning |
|-----|---------|---------|
| `FEATURE_CONTRACT_PATH` | repo `shared/feature-contract.json` | Contract location (mounted at `/shared` in Docker) |
