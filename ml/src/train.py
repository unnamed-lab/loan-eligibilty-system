"""Train and compare 5 classifiers with Borderline-SMOTE applied INSIDE CV folds.

Methodology highlights (report 3.6, 3.8.2-3.8.5):
  * imputation instead of dropna() (preprocess.py) — no rows discarded
  * SMOTE encapsulated in the CV pipeline -> no leakage into validation folds
  * ROC-AUC computed from probabilities (no silent 0.0 fallback)

Deployment model: the XGBoost classifier is exported to ONNX (cleanest
tree-ensemble export, and also the model that drives SHAP). All 5 models are
still evaluated for the Chapter 4 comparison table.
"""
import json
import warnings
from pathlib import Path

from imblearn.over_sampling import BorderlineSMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
from sklearn import svm
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, confusion_matrix, f1_score,
                             precision_score, recall_score, roc_auc_score)
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from xgboost import XGBClassifier

from preprocess import build_dataset, build_preprocessor

warnings.filterwarnings("ignore")

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"
DATA = ROOT / "data" / "dataset.csv"
SEED = 2


def make_models():
    return {
        "Logistic Regression": LogisticRegression(max_iter=1000, C=1.0),
        "SVM": svm.SVC(kernel="linear", probability=True, random_state=SEED),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=SEED),
        "XGBoost": XGBClassifier(n_estimators=100, learning_rate=0.1,
                                 random_state=SEED, eval_metric="logloss"),
    }


def cv_pipeline(model):
    """Preprocess -> Borderline-SMOTE -> classifier.

    SMOTE only fires at fit time and only on the training fold, so validation
    folds stay untouched (this is the leakage fix vs. the original notebook).
    """
    return ImbPipeline(steps=[
        ("prep", build_preprocessor()),
        ("smote", BorderlineSMOTE(k_neighbors=5, random_state=SEED)),
        ("clf", model),
    ])


def metrics_on(model, X, y):
    pred = model.predict(X)
    try:
        proba = model.predict_proba(X)[:, 1]
        auc = roc_auc_score(y, proba)
    except Exception:
        auc = float("nan")
    tn, fp, fn, tp = confusion_matrix(y, pred).ravel()
    return {
        "accuracy": accuracy_score(y, pred),
        "precision": precision_score(y, pred, zero_division=0),
        "recall": recall_score(y, pred, zero_division=0),
        "f1_weighted": f1_score(y, pred, average="weighted"),
        "f1_macro": f1_score(y, pred, average="macro"),
        "roc_auc": auc,
        "confusion_matrix": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)},
    }


def main():
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    X, y = build_dataset(str(DATA))
    print(f"Dataset: {X.shape[0]} rows, {X.shape[1]} features (no rows dropped).")
    print(f"Class balance: {dict(y.value_counts())}")

    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y, test_size=0.10, stratify=y, random_state=SEED)
    print(f"Train: {X_tr.shape[0]}  Test: {X_te.shape[0]}")

    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)
    cv_results, test_results, fitted = {}, {}, {}

    models = make_models()
    for name, model in models.items():
        pipe = cv_pipeline(model)
        cv = cross_validate(pipe, X_tr, y_tr, cv=skf,
                            scoring=["accuracy", "f1_weighted", "roc_auc"])
        cv_results[name] = {
            "accuracy_mean": float(cv["test_accuracy"].mean()),
            "accuracy_std": float(cv["test_accuracy"].std()),
            "f1_weighted_mean": float(cv["test_f1_weighted"].mean()),
            "roc_auc_mean": float(cv["test_roc_auc"].mean()),
        }
        pipe.fit(X_tr, y_tr)             # final fit (SMOTE on full train)
        fitted[name] = pipe
        test_results[name] = metrics_on(pipe, X_te, y_te)
        print(f"  {name:22s} test acc={test_results[name]['accuracy']:.4f} "
              f"f1={test_results[name]['f1_weighted']:.4f} auc={test_results[name]['roc_auc']:.4f}")

    # Ensemble (soft voting SVM+XGB) -> exposes probabilities for a real ROC-AUC.
    ens = cv_pipeline(VotingClassifier(
        estimators=[("svm", svm.SVC(kernel="linear", probability=True, random_state=SEED)),
                    ("xgb", XGBClassifier(n_estimators=100, learning_rate=0.1,
                                          random_state=SEED, eval_metric="logloss"))],
        voting="soft"))
    cv = cross_validate(ens, X_tr, y_tr, cv=skf,
                        scoring=["accuracy", "f1_weighted", "roc_auc"])
    cv_results["Ensemble (SVM+XGB)"] = {
        "accuracy_mean": float(cv["test_accuracy"].mean()),
        "accuracy_std": float(cv["test_accuracy"].std()),
        "f1_weighted_mean": float(cv["test_f1_weighted"].mean()),
        "roc_auc_mean": float(cv["test_roc_auc"].mean()),
    }
    ens.fit(X_tr, y_tr)
    fitted["Ensemble (SVM+XGB)"] = ens
    test_results["Ensemble (SVM+XGB)"] = metrics_on(ens, X_te, y_te)
    print(f"  {'Ensemble (SVM+XGB)':22s} test acc={test_results['Ensemble (SVM+XGB)']['accuracy']:.4f}")

    # --- Build the DEPLOYMENT artifact ---
    # Trees are scale-invariant and live requests carry no missing values, so the
    # deployed XGBoost runs on RAW contract-ordered features (no scaler in the
    # graph). This exports cleanly to ONNX and lets SHAP map values straight to
    # feature names.
    sm = BorderlineSMOTE(k_neighbors=5, random_state=SEED)
    X_res, y_res = sm.fit_resample(X_tr, y_tr)
    deploy_xgb = XGBClassifier(n_estimators=100, learning_rate=0.1,
                               random_state=SEED, eval_metric="logloss")
    deploy_xgb.fit(X_res.to_numpy(), y_res.to_numpy())   # numpy -> f0..f10 names
    deploy_xgb.save_model(str(ARTIFACTS / "xgb_model.json"))   # for ONNX + SHAP
    test_results["__deployed__ (raw XGBoost)"] = metrics_on(deploy_xgb, X_te.to_numpy(), y_te)
    print(f"  {'DEPLOYED raw XGBoost':22s} "
          f"test acc={test_results['__deployed__ (raw XGBoost)']['accuracy']:.4f}")

    with open(ARTIFACTS / "cv_results.json", "w") as f:
        json.dump(cv_results, f, indent=2)
    with open(ARTIFACTS / "metrics.json", "w") as f:
        json.dump(test_results, f, indent=2)

    print("\nSaved: xgb_model.json (deployed), metrics.json, cv_results.json")


if __name__ == "__main__":
    main()
