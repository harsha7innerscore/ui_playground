# ml_playground

A hands-on tour of the core Python data stack and core machine learning
concepts: NumPy, pandas, data cleaning, exploratory analysis, matplotlib,
and scikit-learn. Fourteen scripts, run in order, each one standalone and
readable top to bottom.

## Quick start

```bash
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python -r requirements.txt
./run_all.sh
```

Or run one lesson at a time:

```bash
.venv/bin/python 01_numpy_basics.py
```

## What's here

| Script | Covers |
|---|---|
| [00_make_dataset.py](00_make_dataset.py) | Builds `data/students_raw.csv` — a synthetic, deliberately messy dataset (missing sentinels, inconsistent categories, numbers-as-text, mixed date formats, duplicates, impossible values) |
| [01_numpy_basics.py](01_numpy_basics.py) | Arrays vs lists, dtype & shape, views vs copies, boolean/fancy indexing, broadcasting, axis-based aggregation, NaN handling, vectorization performance |
| [02_pandas_basics.py](02_pandas_basics.py) | Series & index alignment, DataFrame construction/inspection, `.loc`/`.iloc`, derived columns, `groupby`, merge/concat/join, pivot/melt, datetimes |
| [03_data_cleaning.py](03_data_cleaning.py) | Audit → deduplicate → standardize text/types → fix impossible values → handle missing data → treat outliers → validate. Writes `data/students_clean.csv` |
| [04_exploration.py](04_exploration.py) | Univariate and bivariate analysis, segmentation, time trends, and — critically — challenging the headline finding against imputation, outliers, and confounds |
| [05_matplotlib_visualization.py](05_matplotlib_visualization.py) | The Figure/Axes API, histograms, box/violin plots, bar charts, scatter + fit lines, heatmaps, time series, a composed dashboard. Writes PNGs to `outputs/` |
| [06_supervised_vs_unsupervised.py](06_supervised_vs_unsupervised.py) | Fitting a model to a known label (supervised) vs. finding structure with no label at all (unsupervised), on the same dataset |
| [07_regression_vs_classification.py](07_regression_vs_classification.py) | Predicting a continuous number vs. a discrete category from the same features, and why their metrics don't transfer |
| [08_linear_regression.py](08_linear_regression.py) | Fitting a line by hand with NumPy, matching it with scikit-learn, multiple regression, coefficient interpretation, residual diagnostics |
| [09_logistic_regression.py](09_logistic_regression.py) | The sigmoid, log-odds coefficients as odds ratios, `predict_proba` vs. `predict`, and the 0.5 decision threshold as a tunable choice |
| [10_decision_trees.py](10_decision_trees.py) | Reading a tree as rules, feature importances, classification and regression trees, and overfitting as tree depth grows unconstrained |
| [11_kmeans_clustering.py](11_kmeans_clustering.py) | Why features must be scaled first, choosing k with the elbow method and silhouette score, profiling and naming the resulting clusters |
| [12_train_val_test_overfitting.py](12_train_val_test_overfitting.py) | Why tuning needs a validation split separate from train and test, underfitting vs. overfitting curves, learning curves, touching test once |
| [13_precision_recall_f1.py](13_precision_recall_f1.py) | Why accuracy misleads on imbalanced classes, the confusion matrix, precision/recall/F1 by hand and via scikit-learn, the threshold tradeoff |

`lesson_utils.py` holds the shared printing helpers (`demo`, `note`, `section`) that make the scripts read as a narrated lesson rather than a silent script.

See [CLAUDE.md](CLAUDE.md) for version constraints and project conventions.
