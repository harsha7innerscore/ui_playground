"""Regression vs. classification on data/students_clean.csv.

Run:  .venv/bin/python 07_regression_vs_classification.py   (run 03_data_cleaning.py first)

Both are supervised -- both learn from (features, known answer) pairs. The
split is about the shape of the answer: regression predicts a number on a
continuous scale, classification predicts one of a fixed set of categories.
Same features, same rows, two different targets, two different families of
metric.
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import accuracy_score, mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from lesson_utils import demo, note, run, section

CLEAN_CSV = Path(__file__).parent / "data" / "students_clean.csv"
FEATURES = ["study_minutes", "attendance_pct"]


def load() -> pd.DataFrame:
    df = pd.read_csv(CLEAN_CSV)
    df["passed"] = (df["average_score"] >= df["average_score"].median()).astype(int)
    return df


def section_same_rows_two_questions() -> None:
    """One dataset, one set of features, two different things to predict."""
    df = load()
    section("two targets derived from the same table")
    demo("regression target: average_score", df["average_score"].describe()[["min", "mean", "max"]].round(1))
    demo("classification target: passed (1 = at/above the median score)", df["passed"].value_counts())
    note("average_score is a continuous number -- 61.3, 74.8, 82.0 are all valid and "
         "meaningfully ordered. passed is one of exactly two labels -- there is no "
         "'61.3' version of a class. That distinction is the entire difference "
         "between the two problem types; it has nothing to do with which algorithm "
         "you reach for.")


def section_regression_predicts_a_number() -> None:
    """Fit a model whose output is a continuous score, and evaluate it as one."""
    df = load()
    X_train, X_test, y_train, y_test = train_test_split(
        df[FEATURES], df["average_score"], test_size=0.2, random_state=0
    )
    model = LinearRegression().fit(X_train, y_train)
    predictions = model.predict(X_test)

    section("regression: average_score is a number")
    demo("sample predictions vs actual", pd.DataFrame({
        "predicted": predictions[:5].round(1), "actual": y_test.values[:5]
    }))
    demo("mean absolute error (points of score)", round(mean_absolute_error(y_test, predictions), 2))
    demo("R-squared", round(r2_score(y_test, predictions), 3))
    note("A prediction of 71.4 when the truth is 73.0 is a small, meaningful error -- "
         "'close' is a well-defined idea on a continuous scale. Errors are measured "
         "in the same units as the target (points of score). The negative R-squared "
         "here is itself a real finding, not a bug: these two features barely predict "
         "average_score on this split (04_exploration.py found the raw study_minutes "
         "correlation was weak until outliers were removed) -- it means the model "
         "does worse than just guessing the training mean for every test row.")


def section_classification_predicts_a_category() -> None:
    """Fit a model whose output is a class label, and evaluate it as one."""
    df = load()
    X_train, X_test, y_train, y_test = train_test_split(
        df[FEATURES], df["passed"], test_size=0.2, random_state=0, stratify=df["passed"]
    )
    scaler = StandardScaler().fit(X_train)
    model = LogisticRegression().fit(scaler.transform(X_train), y_train)
    predictions = model.predict(scaler.transform(X_test))

    section("classification: passed is one of two labels")
    demo("sample predictions vs actual", pd.DataFrame({
        "predicted": predictions[:5], "actual": y_test.values[:5]
    }))
    demo("accuracy (fraction of labels matched exactly)", round(accuracy_score(y_test, predictions), 3))
    note("There is no 'close' here -- predicting 0 when the truth is 1 is entirely "
         "wrong, the same as predicting 0 when the truth is, hypothetically, "
         "'extremely 1'. That is why mean absolute error is meaningless for a "
         "label and accuracy (or precision/recall -- see 13_precision_recall_f1.py) "
         "is meaningless for a continuous target.")


def section_metrics_do_not_transfer() -> None:
    """Why you can't borrow regression metrics for classification, or vice versa."""
    section("why the two families of metric cannot swap")
    for line in [
        "R-squared and mean absolute error need subtraction and distance between "
        "predicted and actual values -- that requires an ordered, numeric target",
        "accuracy, precision, recall and F1 need a notion of 'exactly right vs "
        "wrong' -- that requires a finite set of discrete labels",
        "a model that outputs probabilities (LogisticRegression.predict_proba) sits "
        "in between: the raw output is a number, but it is used to choose a "
        "category, so classification metrics still apply to the final decision",
    ]:
        note(f"- {line}")

    section("picking the right one from the question being asked")
    examples = [
        ("predict a student's exact exam score", "regression"),
        ("predict whether a student will pass or fail", "classification"),
        ("predict how many minutes a student will study tomorrow", "regression"),
        ("predict which of 4 performance tiers a student falls into", "classification (multi-class)"),
    ]
    for question, kind in examples:
        print(f"  \"{question}\" -> {kind}")


SECTIONS = [
    section_same_rows_two_questions,
    section_regression_predicts_a_number,
    section_classification_predicts_a_category,
    section_metrics_do_not_transfer,
]

if __name__ == "__main__":
    run(SECTIONS)
