"""Sanity tests for the feature contract and preprocessing.

Run from the ``ml/`` directory:  ``pytest``
"""
import sys
from pathlib import Path

# Make ``src/`` importable without installing the package.
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from contract import FEATURE_ORDER, ENCODERS  # noqa: E402
from preprocess import build_dataset           # noqa: E402

DATA = Path(__file__).resolve().parents[1] / "data" / "dataset.csv"

EXPECTED_ORDER = [
    "Gender", "Married", "Dependents", "Education", "Self_Employed",
    "ApplicantIncome", "CoapplicantIncome", "LoanAmount", "Loan_Amount_Term",
    "Credit_History", "Property_Area",
]


def test_feature_order_is_locked():
    assert FEATURE_ORDER == EXPECTED_ORDER, "feature order must never change"


def test_property_area_mapping():
    assert ENCODERS["Property_Area"] == {"Rural": 0, "Semiurban": 1, "Urban": 2}


def test_dataset_has_no_nans_after_imputation():
    X, y = build_dataset(str(DATA))
    assert not X.isna().any().any(), "imputation should leave no NaNs"
    assert list(X.columns) == EXPECTED_ORDER
    assert set(y.unique()) <= {0, 1}


def test_no_rows_dropped():
    import pandas as pd
    raw_rows = len(pd.read_csv(DATA))
    X, _ = build_dataset(str(DATA))
    assert X.shape[0] == raw_rows, "imputation must preserve every row (no dropna)"
