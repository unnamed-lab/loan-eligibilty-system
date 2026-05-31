"""Export the deployed XGBoost model (raw contract-ordered features) to ONNX and
verify ONNX predictions match the Python model.

Direct ``onnxmltools`` conversion avoids the skl2onnx<->onnxmltools type clash.
XGBoost -> ``ai.onnx.ml`` TreeEnsembleClassifier, which runs in ONNX Runtime
(the ``ort`` Rust crate). ``tract`` support for these ops is only partial, which
is why the inference engine uses ``ort``.
"""
import json
from pathlib import Path

import numpy as np
import onnxruntime as ort
from onnxmltools.convert import convert_xgboost
from onnxmltools.convert.common.data_types import FloatTensorType
from xgboost import XGBClassifier

from preprocess import build_dataset
from contract import FEATURE_ORDER

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"
DATA = ROOT / "data" / "dataset.csv"
ONNX_OUT = ARTIFACTS / "model.onnx"


def main():
    model = XGBClassifier()
    model.load_model(str(ARTIFACTS / "xgb_model.json"))

    n = len(FEATURE_ORDER)
    onx = convert_xgboost(model, initial_types=[("input", FloatTensorType([None, n]))],
                          target_opset=12)
    with open(ONNX_OUT, "wb") as f:
        f.write(onx.SerializeToString())
    print(f"Wrote {ONNX_OUT} ({ONNX_OUT.stat().st_size} bytes)")

    X, _ = build_dataset(str(DATA))
    sample = X.iloc[:30].to_numpy().astype(np.float32)
    py_pred = model.predict(X.iloc[:30].to_numpy())

    sess = ort.InferenceSession(str(ONNX_OUT), providers=["CPUExecutionProvider"])
    iname = sess.get_inputs()[0].name
    outs = sess.run(None, {iname: sample})
    onnx_pred = np.asarray(outs[0]).ravel()

    match = int((py_pred == onnx_pred).sum())
    print(f"Prediction parity: {match}/30 rows match")
    print(f"ONNX outputs: {[o.name for o in sess.get_outputs()]}")
    print(f"Feature order (Rust + NestJS must match): {FEATURE_ORDER}")

    meta = {"feature_order": FEATURE_ORDER, "n_features": n,
            "parity_rows_matched": match, "input_name": iname,
            "output_names": [o.name for o in sess.get_outputs()]}
    with open(ARTIFACTS / "onnx_meta.json", "w") as f:
        json.dump(meta, f, indent=2)


if __name__ == "__main__":
    main()
