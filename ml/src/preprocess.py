"""Preprocessing for the loan eligibility dataset.

Implements the methodology described in the report (section 3.8.1):
  - attribute-specific imputation (mode for categorical, median for continuous)
    instead of ``dropna()``, so every row is preserved (Hasan et al. 2023).
  - encoding via the shared feature contract (no ad-hoc ``.map()`` calls).
  - StandardScaler on continuous features, embedded in the pipeline so it can be
    serialised into the ONNX graph (the Rust engine then needs no scaler logic).
"""
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from contract import FEATURE_ORDER, CATEGORICAL_IMPUTE, CONTINUOUS_IMPUTE, ENCODERS, TARGET

# Columns treated as continuous (scaled). The rest are passed through as-is.
CONTINUOUS = ["ApplicantIncome", "CoapplicantIncome", "LoanAmount", "Loan_Amount_Term"]
PASSTHROUGH = [c for c in FEATURE_ORDER if c not in CONTINUOUS]
# Positional indices (so the ONNX graph takes ONE float tensor, not named columns).
CONTINUOUS_IDX = [FEATURE_ORDER.index(c) for c in CONTINUOUS]
PASSTHROUGH_IDX = [FEATURE_ORDER.index(c) for c in PASSTHROUGH]


def load_raw(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    # Drop any stray unnamed index column from CSV exports.
    df = df.loc[:, ~df.columns.str.match(r"^Unnamed")]
    return df


def encode_target(series: pd.Series) -> pd.Series:
    enc = TARGET["encoding"]
    return series.map(lambda v: enc.get(v, enc.get(str(v), v))).astype(int)


def encode_features(df: pd.DataFrame) -> pd.DataFrame:
    """Apply contract string->int encoding and recode Dependents '3+' -> 4."""
    df = df.copy()
    if "Dependents" in df.columns:
        df["Dependents"] = df["Dependents"].replace({"3+": 4})
        df["Dependents"] = pd.to_numeric(df["Dependents"], errors="coerce")
    for col, enc in ENCODERS.items():
        if col == "Dependents" or col not in df.columns:
            continue
        df[col] = df[col].map(lambda v: enc.get(v, enc.get(str(v), v)))
        df[col] = pd.to_numeric(df[col], errors="coerce")
    return df


def build_dataset(csv_path: str):
    """Return (X, y) where X has columns in the exact contract order."""
    df = load_raw(csv_path)
    y = encode_target(df[TARGET["name"]])
    df = encode_features(df)

    # Impute BEFORE assembling X so we keep every row (no dropna).
    for col in CATEGORICAL_IMPUTE:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].mode(dropna=True)[0])
    if "Dependents" in df.columns:
        df["Dependents"] = df["Dependents"].fillna(df["Dependents"].mode(dropna=True)[0])
    for col in CONTINUOUS_IMPUTE:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].median())
    # Any remaining continuous gaps -> median.
    for col in CONTINUOUS:
        if col in df.columns and df[col].isna().any():
            df[col] = df[col].fillna(df[col].median())

    X = df[FEATURE_ORDER].astype(float)
    return X, y


def build_preprocessor() -> ColumnTransformer:
    """Scaling on continuous columns; everything else passed through.

    Median imputation is repeated here as a safety net inside the fitted
    pipeline, so the transformer is robust even on unseen raw data.
    """
    cont = Pipeline(steps=[
        ("impute", SimpleImputer(strategy="median")),
        ("scale", StandardScaler()),
    ])
    return ColumnTransformer(
        transformers=[
            ("cont", cont, CONTINUOUS_IDX),
            ("pass", SimpleImputer(strategy="most_frequent"), PASSTHROUGH_IDX),
        ],
        remainder="drop",
    )
