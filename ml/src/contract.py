"""Loads the shared feature contract and provides encoding helpers.

This is the Python view of ``shared/feature-contract.json`` — the SAME file the
Rust engine and NestJS gateway read, guaranteeing identical feature handling
across the whole polyglot system.
"""
import json
from pathlib import Path

_CONTRACT_PATH = Path(__file__).resolve().parents[2] / "shared" / "feature-contract.json"


def load_contract() -> dict:
    with open(_CONTRACT_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


CONTRACT = load_contract()

# Ordered feature names — the column order every service must respect.
FEATURE_ORDER = [f["name"] for f in sorted(CONTRACT["features"], key=lambda x: x["index"])]

CATEGORICAL_IMPUTE = CONTRACT["imputation"]["categorical"]
CONTINUOUS_IMPUTE = CONTRACT["imputation"]["continuous"]

# Per-feature string->int encoders (used for any raw string categoricals).
ENCODERS = {f["name"]: f.get("encoding") for f in CONTRACT["features"] if f.get("encoding")}
TARGET = CONTRACT["target"]


def encode_value(feature_name: str, value):
    """Encode a single raw value for one feature using the contract."""
    enc = ENCODERS.get(feature_name)
    if enc is None:
        return value
    # Allow already-encoded ints to pass through.
    if value in enc:
        return enc[value]
    if str(value) in enc:
        return enc[str(value)]
    return value
