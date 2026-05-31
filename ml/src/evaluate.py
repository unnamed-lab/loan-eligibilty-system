"""Generate the Chapter 4 comparison table (Markdown) and plots from the
metrics produced by train.py."""
import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"
PLOTS = ARTIFACTS / "plots"


def main():
    PLOTS.mkdir(parents=True, exist_ok=True)
    metrics = json.loads((ARTIFACTS / "metrics.json").read_text())

    # Comparison table (Markdown) for the report.
    rows = ["| Model | Accuracy | Precision | Recall | F1 (weighted) | ROC-AUC |",
            "|-------|----------|-----------|--------|---------------|---------|"]
    for name, m in metrics.items():
        rows.append(f"| {name} | {m['accuracy']:.4f} | {m['precision']:.4f} | "
                    f"{m['recall']:.4f} | {m['f1_weighted']:.4f} | {m['roc_auc']:.4f} |")
    table = "\n".join(rows)
    (ARTIFACTS / "comparison_table.md").write_text(table)
    print(table)

    # Bar chart of test accuracy + F1.
    names = [n for n in metrics if not n.startswith("__")]
    acc = [metrics[n]["accuracy"] for n in names]
    f1 = [metrics[n]["f1_weighted"] for n in names]
    x = range(len(names))
    plt.figure(figsize=(11, 5))
    plt.bar([i - 0.2 for i in x], acc, width=0.4, label="Accuracy")
    plt.bar([i + 0.2 for i in x], f1, width=0.4, label="F1 (weighted)")
    plt.xticks(list(x), names, rotation=20, ha="right")
    plt.ylim(0.5, 1.0)
    plt.ylabel("Score"); plt.title("Model Comparison (10% held-out test set)")
    plt.legend(); plt.tight_layout()
    plt.savefig(PLOTS / "model_comparison.png", dpi=130)
    print(f"\nSaved plot: {PLOTS / 'model_comparison.png'}")


if __name__ == "__main__":
    main()
