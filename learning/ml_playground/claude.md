# ml_playground

Learning sandbox for the Python data stack: NumPy, pandas, data cleaning, exploration, and matplotlib.
Each script is a standalone, runnable lesson — run it, read the printed output, then read the source.

## Tech Stack & Version Constraints

| Tool       | Version  | Note |
|------------|----------|------|
| Python     | 3.12     | System Python is 3.9.6; the venv pins 3.12 via `uv`. |
| NumPy      | >=2.0    | NumPy 2.x — `np.float_`, `np.NaN`, `np.product` are gone. |
| pandas     | >=2.2    | Copy-on-Write semantics; `applymap` is `DataFrame.map`. |
| matplotlib | >=3.9    | `Agg` backend used so scripts run headless. |

Node constraints in the workspace root `CLAUDE.md` do not apply here — this project has no Node dependency.

## Setup

```bash
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python -r requirements.txt
```

## Dev Commands

```bash
.venv/bin/python 00_make_dataset.py        # regenerate data/students_raw.csv
.venv/bin/python 01_numpy_basics.py        # arrays, dtypes, broadcasting, vectorization
.venv/bin/python 02_pandas_basics.py       # Series, DataFrame, selection, groupby, joins
.venv/bin/python 03_data_cleaning.py       # missing values, dtypes, duplicates, outliers
.venv/bin/python 04_exploration.py         # describe, distributions, correlation, pivots
.venv/bin/python 05_matplotlib_visualization.py  # figures/axes, chart types, styling
./run_all.sh                               # all of the above in order
```

## Project Conventions

- Scripts are numbered; later scripts assume the concepts of earlier ones.
- Every lesson is a `section_*` function; `main()` runs them in order. A section is independently runnable in a REPL.
- `demo(label, value)` prints a labelled result — lessons teach through printed output, not comments.
- Data artifacts live in `data/`; `students_raw.csv` is deliberately messy and is the input to script 03.
  `students_clean.csv` is its output and the input to scripts 04 and 05.
- Charts are written to `outputs/` as PNG. Never call `plt.show()` — the backend is non-interactive.
- Random data uses a seeded `np.random.default_rng(SEED)`; output must be reproducible across runs.

## Architecture Decisions

- **No notebooks.** Plain `.py` files diff cleanly in git and run in CI.
- **One messy dataset threaded through every script** so cleaning, exploration and plotting operate on the
  same domain instead of toy arrays invented per file.
- **Modern pandas only.** No `inplace=True`, no chained assignment, no positional `[]` indexing —
  these break or warn under Copy-on-Write. Use `.loc`, `.iloc`, and reassignment.
