# Inference engine (Rust)

A standalone HTTP microservice that loads `models/model.onnx` **once** at startup
and serves loan-eligibility predictions in sub-100 ms.

## Endpoints

| Method | Path | Body | Response |
|--------|------|------|----------|
| `POST` | `/predict` | `{ "features": [f32; 11] }` | `{ eligible, probability, latency_ms }` |
| `GET` | `/health` | — | `{ "status": "ok" }` |

`features` must be the **11-float vector in feature-contract order**, already
string→int encoded by the gateway (the engine stays deliberately dumb).

## Why `ort` (not `tract`)

XGBoost exports to `ai.onnx.ml` `TreeEnsembleClassifier`. `ort` (ONNX Runtime
bindings) supports these tree ops fully; `tract` only partially. The engine is
still a genuine Rust service — only the runtime library differs.

## Run locally

```bash
cargo run --release         # needs models/model.onnx (MODEL_PATH to override)
# in another shell:
curl -s localhost:8081/predict -H 'Content-Type: application/json' \
  -d '{"features":[1,1,0,0,1,3000,0,66,360,1,2]}'
```

> **Build notes.** `Cargo.lock` is committed and the build uses `--locked` so the
> dependency set stays reproducible (`ort` rc.9 + `ort-sys` rc.9 + `ureq` 2.x).
> The supported build path is **Docker / Linux** (`docker compose build
> inference-engine`). Building natively on **Windows** requires a current MSVC
> toolset — the prebuilt ONNX Runtime static library needs recent MSVC STL
> symbols, so an older Visual Studio Build Tools install fails at link time.

## Test

```bash
cargo test --release        # loads the real model, checks the sample applicant
```

## Environment

| Var | Default | Meaning |
|-----|---------|---------|
| `MODEL_PATH` | `models/model.onnx` | Path to the ONNX model |
| `PORT` | `8081` | Listen port |
