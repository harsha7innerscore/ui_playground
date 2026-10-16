#!/usr/bin/env bash
# Run every lesson in order, as a fresh learner would.
set -euo pipefail
cd "$(dirname "$0")"

PY=.venv/bin/python
[ -x "$PY" ] || { echo "no venv -- run: uv venv --python 3.12 .venv && uv pip install --python $PY -r requirements.txt" >&2; exit 1; }

for script in 00_make_dataset.py 01_numpy_basics.py 02_pandas_basics.py 03_data_cleaning.py 04_exploration.py \
              05_matplotlib_visualization.py 06_supervised_vs_unsupervised.py 07_regression_vs_classification.py \
              08_linear_regression.py 09_logistic_regression.py 10_decision_trees.py 11_kmeans_clustering.py \
              12_train_val_test_overfitting.py 13_precision_recall_f1.py; do
  echo
  echo "################  $script  ################"
  "$PY" "$script"
done
