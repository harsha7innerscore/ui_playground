# ml_playground

A hands-on tour of the core Python data stack: NumPy, pandas, data cleaning,
exploratory analysis, and matplotlib. Six scripts, run in order, each one
standalone and readable top to bottom.

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

`lesson_utils.py` holds the shared printing helpers (`demo`, `note`, `section`) that make the scripts read as a narrated lesson rather than a silent script.

See [CLAUDE.md](CLAUDE.md) for version constraints and project conventions.
