"""Train/validation/test splits and overfitting, on data/students_clean.csv.

Run:  .venv/bin/python 12_train_val_test_overfitting.py   (run 03_data_cleaning.py first)

Three splits, three jobs. Train: what the model learns from. Validation: what
you use to compare models or tune a knob (tree depth, polynomial degree,
regularization strength) without touching the real holdout. Test: touched
exactly once, at the very end, to report how the final choice will do on data
it has never influenced in any way -- not even indirectly through a tuning
decision. Skip the validation split and tune against the test set instead,
and the test score stops meaning what you think it means.
"""

from __future__ import annotations

from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeRegressor

from lesson_utils import demo, note, run, section

CLEAN_CSV = Path(__file__).parent / "data" / "students_clean.csv"
OUTPUT_DIR = Path(__file__).parent / "outputs"
FEATURES = ["study_minutes", "attendance_pct", "grade"]
TARGET = "average_score"


def three_way_split(df: pd.DataFrame):
    """60% train, 20% validation, 20% test -- two splits to get three groups."""
    train, holdout = train_test_split(df, test_size=0.4, random_state=0)
    val, test = train_test_split(holdout, test_size=0.5, random_state=0)
    return train, val, test


def section_why_three_splits_not_two() -> None:
    """Tuning against the test set is the same mistake as training on it."""
    df = pd.read_csv(CLEAN_CSV)
    train, val, test = three_way_split(df)

    section("three splits, three jobs")
    demo("train rows (fit the model)", len(train))
    demo("validation rows (compare candidate models, pick hyperparameters)", len(val))
    demo("test rows (touched once, at the end)", len(test))
    note("With only train/test, the only place left to tune max_depth or compare "
         "two models is the test set -- but then the test score reflects a choice "
         "that was made to maximize it, which is exactly what test performance is "
         "supposed to measure honestly. A validation set absorbs that tuning so "
         "the test score stays an unbiased estimate of real-world performance.")


def section_underfitting_vs_overfitting() -> None:
    """Sweep model complexity; train error always falls, validation error does not."""
    df = pd.read_csv(CLEAN_CSV)
    train, val, test = three_way_split(df)

    section("error vs. model complexity (tree depth)")
    depths = list(range(1, 16))
    train_errors, val_errors = [], []
    for depth in depths:
        model = DecisionTreeRegressor(max_depth=depth, random_state=0).fit(train[FEATURES], train[TARGET])
        train_errors.append(mean_absolute_error(train[TARGET], model.predict(train[FEATURES])))
        val_errors.append(mean_absolute_error(val[TARGET], model.predict(val[FEATURES])))

    table = pd.DataFrame({"depth": depths, "train_mae": train_errors, "val_mae": val_errors}).set_index("depth")
    demo("train vs. validation MAE", table.round(2))

    best_depth = int(table["val_mae"].idxmin())
    demo("depth with lowest validation error", best_depth)
    note("Early depths underfit: both errors are high because the tree is too "
         "simple to capture the real pattern. Past the best depth, train error "
         "keeps dropping while validation error flattens or climbs -- the tree is "
         "now fitting noise specific to the training rows. The validation curve's "
         "minimum, not the training curve, is what picks the depth.")

    OUTPUT_DIR.mkdir(exist_ok=True)
    fig, ax = plt.subplots(figsize=(7, 4.5))
    ax.plot(depths, train_errors, marker="o", label="train MAE")
    ax.plot(depths, val_errors, marker="o", label="validation MAE")
    ax.axvline(best_depth, color="gray", linestyle="--", linewidth=1, label=f"best depth = {best_depth}")
    ax.set(xlabel="max_depth", ylabel="mean absolute error", title="underfitting <- -> overfitting")
    ax.legend()
    fig.tight_layout()
    fig.savefig(OUTPUT_DIR / "20_overfitting_curve.png", dpi=110)
    plt.close(fig)
    demo("saved", "outputs/20_overfitting_curve.png")
    return best_depth


def section_the_final_test_score() -> None:
    """Refit the chosen model on train, evaluate it on test exactly once."""
    df = pd.read_csv(CLEAN_CSV)
    train, val, test = three_way_split(df)

    section("using the test set, finally, and only once")
    depths = list(range(1, 16))
    val_errors = []
    for depth in depths:
        model = DecisionTreeRegressor(max_depth=depth, random_state=0).fit(train[FEATURES], train[TARGET])
        val_errors.append(mean_absolute_error(val[TARGET], model.predict(val[FEATURES])))
    best_depth = depths[int(np.argmin(val_errors))]
    demo("chosen depth (picked using validation only)", best_depth)

    final_model = DecisionTreeRegressor(max_depth=best_depth, random_state=0).fit(train[FEATURES], train[TARGET])
    test_mae = mean_absolute_error(test[TARGET], final_model.predict(test[FEATURES]))
    demo("test MAE (the number that goes in a report)", round(test_mae, 2))
    note("If this number disappoints, the fix is to go back, change the approach, "
         "and evaluate on a fresh test set -- not to re-check this same test set "
         "against a different depth. The instant a test score influences a "
         "decision, it has been spent and stops being an honest estimate.")


def section_overfitting_also_happens_with_too_little_data() -> None:
    """The same model, fit on shrinking slices of the training set."""
    df = pd.read_csv(CLEAN_CSV)
    train, val, test = three_way_split(df)

    section("a learning curve: error vs. training-set size, depth fixed")
    sizes = [20, 50, 100, 150, 200, len(train)]
    train_errors, val_errors = [], []
    for size in sizes:
        subset = train.iloc[:size]
        model = DecisionTreeRegressor(max_depth=5, random_state=0).fit(subset[FEATURES], subset[TARGET])
        train_errors.append(mean_absolute_error(subset[TARGET], model.predict(subset[FEATURES])))
        val_errors.append(mean_absolute_error(val[TARGET], model.predict(val[FEATURES])))
    demo("train vs. validation MAE by training size", pd.DataFrame(
        {"train_rows": sizes, "train_mae": np.round(train_errors, 2), "val_mae": np.round(val_errors, 2)}
    ).set_index("train_rows"))
    note("With a fixed model complexity, a small training set lets the model fit "
         "its few examples almost perfectly (low train error) while generalizing "
         "badly (high validation error) -- the gap narrows as more rows are added. "
         "This is the other lever against overfitting besides reducing complexity: "
         "more data.")


SECTIONS = [
    section_why_three_splits_not_two,
    section_underfitting_vs_overfitting,
    section_the_final_test_score,
    section_overfitting_also_happens_with_too_little_data,
]

if __name__ == "__main__":
    run(SECTIONS)
