"""Logistic regression on data/students_clean.csv.

Run:  .venv/bin/python 09_logistic_regression.py   (run 03_data_cleaning.py first)

Logistic regression is linear regression's answer to a yes/no question. It
fits a straight line in log-odds space, then squashes that line through the
sigmoid function so the output is always a probability between 0 and 1.
This lesson predicts whether a student passes (average_score at or above the
median), reads the coefficients as odds ratios, and shows that the 0.5 cutoff
used to turn a probability into a decision is a choice, not a law of nature.
"""

from __future__ import annotations

from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from lesson_utils import demo, note, run, section

CLEAN_CSV = Path(__file__).parent / "data" / "students_clean.csv"
OUTPUT_DIR = Path(__file__).parent / "outputs"
FEATURES = ["study_minutes", "attendance_pct"]


def load() -> pd.DataFrame:
    df = pd.read_csv(CLEAN_CSV)
    df["passed"] = (df["average_score"] >= df["average_score"].median()).astype(int)
    return df


def sigmoid(z: np.ndarray) -> np.ndarray:
    return 1 / (1 + np.exp(-z))


def section_why_not_just_use_linear_regression() -> None:
    """A straight line can predict -0.3 or 1.8; a probability can't be either."""
    df = load()
    section("the problem with a linear fit on a 0/1 target")
    slope, intercept = np.polyfit(df["attendance_pct"], df["passed"], deg=1)
    worst_case = slope * df["attendance_pct"].min() + intercept
    best_case = slope * df["attendance_pct"].max() + intercept
    demo("linear fit's 'probability' at min attendance", round(float(worst_case), 3))
    demo("linear fit's 'probability' at max attendance", round(float(best_case), 3))
    note("A straight line has no ceiling or floor, so it happily predicts values "
         "below 0 or above 1 -- meaningless as a probability. Logistic regression "
         "fixes this by fitting the line in log-odds space, then passing it through "
         "the sigmoid, 1 / (1 + e^-z), which is bounded between 0 and 1 for every "
         "real-valued z.")


def section_fitting_the_model() -> None:
    """Fit on standardized features; read predict_proba as the model's real output."""
    df = load()
    X_train, X_test, y_train, y_test = train_test_split(
        df[FEATURES], df["passed"], test_size=0.2, random_state=0, stratify=df["passed"]
    )
    scaler = StandardScaler().fit(X_train)
    model = LogisticRegression().fit(scaler.transform(X_train), y_train)

    section("the fitted model")
    demo("coefficients (log-odds per standard deviation of feature)",
         {name: round(float(c), 3) for name, c in zip(FEATURES, model.coef_[0])})
    demo("intercept", round(float(model.intercept_[0]), 3))
    note("Features are standardized first because the raw scales differ wildly "
         "(minutes vs. percent) -- without that, the coefficient magnitudes "
         "wouldn't be comparable to each other.")

    probabilities = model.predict_proba(scaler.transform(X_test))[:, 1]
    section("the real output is a probability, not a label")
    demo("predict_proba for the first 5 test students", probabilities[:5].round(3))
    demo("predict (threshold at 0.5) for the same 5", model.predict(scaler.transform(X_test))[:5])
    note(".predict() is just .predict_proba() >= 0.5 -- scikit-learn hides that "
         "default for convenience, but every classifier's decision is a probability "
         "plus a cutoff. The cutoff is a choice you can change.")
    return model, scaler, X_test, y_test, probabilities


def section_odds_ratios() -> None:
    """exp(coefficient) turns log-odds into something readable: an odds ratio."""
    df = load()
    X_train, _, y_train, _ = train_test_split(
        df[FEATURES], df["passed"], test_size=0.2, random_state=0, stratify=df["passed"]
    )
    scaler = StandardScaler().fit(X_train)
    model = LogisticRegression().fit(scaler.transform(X_train), y_train)

    section("turning coefficients into odds ratios")
    odds_ratios = {name: round(float(np.exp(c)), 2) for name, c in zip(FEATURES, model.coef_[0])}
    demo("odds ratio per +1 standard deviation", odds_ratios)
    note(f"An odds ratio of {odds_ratios['attendance_pct']} for attendance_pct means: "
         "one standard deviation more attendance multiplies the odds of passing by "
         f"{odds_ratios['attendance_pct']}, holding study_minutes fixed. An odds ratio "
         "near 1.0 means that feature barely moves the prediction once the other one "
         "is accounted for.")


def section_the_threshold_is_a_choice() -> None:
    """Moving the cutoff trades false positives for false negatives, not a free lunch."""
    df = load()
    X_train, X_test, y_train, y_test = train_test_split(
        df[FEATURES], df["passed"], test_size=0.2, random_state=0, stratify=df["passed"]
    )
    scaler = StandardScaler().fit(X_train)
    model = LogisticRegression().fit(scaler.transform(X_train), y_train)
    probabilities = model.predict_proba(scaler.transform(X_test))[:, 1]

    section("accuracy at different cutoffs")
    for threshold in [0.3, 0.5, 0.7]:
        predicted = (probabilities >= threshold).astype(int)
        acc = accuracy_score(y_test, predicted)
        tn, fp, fn, tp = confusion_matrix(y_test, predicted).ravel()
        demo(f"threshold={threshold}", f"accuracy={acc:.3f}  false positives={fp}  false negatives={fn}")
    note("Lowering the threshold labels more students 'passed', catching more true "
         "passers (fewer false negatives) at the cost of more false alarms (more "
         "false positives). 0.5 is the default because it is symmetric, not because "
         "it is correct for every use case -- see 13_precision_recall_f1.py for how "
         "to pick a threshold deliberately.")

    OUTPUT_DIR.mkdir(exist_ok=True)
    z = np.linspace(-6, 6, 200)
    fig, ax = plt.subplots(figsize=(6, 4.2))
    ax.plot(z, sigmoid(z), color="steelblue", linewidth=2)
    ax.axhline(0.5, color="gray", linestyle="--", linewidth=1)
    ax.axvline(0, color="gray", linestyle="--", linewidth=1)
    ax.set(xlabel="log-odds (z)", ylabel="sigmoid(z) = predicted probability",
           title="the sigmoid squashes any real number into (0, 1)")
    fig.tight_layout()
    fig.savefig(OUTPUT_DIR / "18_logistic_sigmoid.png", dpi=110)
    plt.close(fig)
    demo("saved", "outputs/18_logistic_sigmoid.png")


SECTIONS = [
    section_why_not_just_use_linear_regression,
    section_fitting_the_model,
    section_odds_ratios,
    section_the_threshold_is_a_choice,
]

if __name__ == "__main__":
    run(SECTIONS)
