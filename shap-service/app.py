"""SHAP explainability sidecar (FastAPI).

Holds the deployed XGBoost model + a TreeExplainer. Given an applicant's
11-feature vector (contract order), returns per-feature SHAP contributions and
the top human-readable drivers — the regulatory "reasons for decision".

  POST /explain  { "features": [f32; 11] }
    -> { base_value, contributions: [{feature, value, shap}], top_reasons: [str] }
  GET  /health
"""
import json
import os
from pathlib import Path

import numpy as np
import shap
import xgboost as xgb
from fastapi import FastAPI
from pydantic import BaseModel

ROOT = Path(__file__).resolve().parent
ARTIFACTS = ROOT / "artifacts"

# The contract is mounted at /shared in Docker; fall back to the repo path locally.
_contract_path = os.environ.get("FEATURE_CONTRACT_PATH")
if _contract_path and Path(_contract_path).exists():
    CONTRACT = json.loads(Path(_contract_path).read_text())
else:
    CONTRACT = json.loads((ROOT.parent / "shared" / "feature-contract.json").read_text())

FEATURES = [f["name"] for f in sorted(CONTRACT["features"], key=lambda x: x["index"])]

app = FastAPI(title="Loan SHAP Explainer", version="1.0.0")

_model = xgb.XGBClassifier()
_model.load_model(str(ARTIFACTS / "xgb_model.json"))
_explainer = shap.TreeExplainer(_model)


class ExplainRequest(BaseModel):
    features: list[float]


def _humanize(feature: str, value: float, shap_val: float) -> str:
    direction = "increased" if shap_val > 0 else "reduced"
    pretty = feature.replace("_", " ")
    if feature == "Credit_History":
        state = "good" if value >= 1 else "poor"
        return f"{pretty} ({state}) {direction} approval likelihood"
    return f"{pretty} = {value:g} {direction} approval likelihood"


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/explain")
def explain(req: ExplainRequest):
    x = np.asarray(req.features, dtype=np.float32).reshape(1, -1)
    shap_values = _explainer.shap_values(x)
    vals = np.asarray(shap_values)[0] if np.asarray(shap_values).ndim > 1 else np.asarray(shap_values)
    base = _explainer.expected_value
    base = float(base[0]) if hasattr(base, "__len__") else float(base)

    contributions = [
        {"feature": FEATURES[i], "value": float(req.features[i]), "shap": float(vals[i])}
        for i in range(len(FEATURES))
    ]
    ranked = sorted(contributions, key=lambda c: abs(c["shap"]), reverse=True)
    top_reasons = [_humanize(c["feature"], c["value"], c["shap"]) for c in ranked[:3]]

    return {"base_value": base, "contributions": contributions, "top_reasons": top_reasons}
