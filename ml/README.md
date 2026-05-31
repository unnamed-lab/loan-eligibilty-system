# ML pipeline (Python)

Trains, evaluates, and exports the loan-eligibility model. Productionises the
original Colab notebook into reproducible scripts and fixes its methodology gaps.

## Files

| File | Purpose |
|------|---------|
| `src/contract.py` | Loads the shared feature contract; encoding helpers |
| `src/preprocess.py` | Imputation (not `dropna`) + encoding + scaling pipeline |
| `src/train.py` | Trains 5 models with Borderline-SMOTE **inside** CV folds |
| `src/evaluate.py` | Comparison table (Markdown) + plots |
| `src/export_onnx.py` | XGBoost → ONNX with a parity check vs. the Python model |
| `tests/test_contract.py` | Contract + preprocessing sanity tests |

## What this corrects vs. the notebook

1. **Imputation, not `dropna()`** — mode for categoricals, median for continuous,
   so no rows are discarded.
2. **No SMOTE leakage** — Borderline-SMOTE lives *inside* the CV pipeline, so
   synthetic samples never reach validation folds.
3. **Real ROC-AUC** — computed from probabilities (the hard-voting ensemble's
   silent `0.0` fallback is replaced with soft voting).

## Setup & run

```bash
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cd src
python train.py        # -> artifacts/xgb_model.json, metrics.json, cv_results.json
python evaluate.py     # -> artifacts/comparison_table.md, plots/model_comparison.png
python export_onnx.py  # -> artifacts/model.onnx + onnx_meta.json (parity check)
```

Run order: **`train.py` → `evaluate.py` → `export_onnx.py`**.

## Tests

```bash
pytest        # from the ml/ directory
```

## Artifacts (`artifacts/`)

| File | Consumed by |
|------|-------------|
| `model.onnx` | Rust inference engine (`inference-engine/models/`) |
| `xgb_model.json` | SHAP sidecar (`shap-service/artifacts/`) |
| `metrics.json`, `cv_results.json`, `comparison_table.md`, `plots/` | Report (Chapter 4) |

> The repo ships pre-trained artifacts so the system runs immediately. Replace
> `data/dataset.csv` with the full 614-row Kaggle `ninzaami/loan-predication`
> set and re-run for final results.
