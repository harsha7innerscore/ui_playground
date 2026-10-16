"""Precision, recall, and F1 on data/students_clean.csv.

Run:  .venv/bin/python 13_precision_recall_f1.py   (run 03_data_cleaning.py first)

Accuracy answers "what fraction did the model get right?" -- a fine question
when classes are balanced, a misleading one when they are not. This lesson
predicts at_risk students (average_score below 60, a minority class: roughly
1 in 5), where a model that always predicts "not at risk" gets high accuracy
while being useless for the one thing that matters: finding at-risk students.
"""

from __future__ import annotations

from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    ConfusionMatrixDisplay,
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from lesson_utils import demo, note, run, section

CLEAN_CSV = Path(__file__).parent / "data" / "students_clean.csv"
OUTPUT_DIR = Path(__file__).parent / "outputs"
FEATURES = ["study_minutes", "attendance_pct"]


def load() -> pd.DataFrame:
    df = pd.read_csv(CLEAN_CSV)
    df["at_risk"] = (df["average_score"] < 60).astype(int)
    return df


def split():
    df = load()
    return train_test_split(
        df[FEATURES], df["at_risk"], test_size=0.25, random_state=0, stratify=df["at_risk"]
    )


def section_why_accuracy_lies_on_imbalanced_classes() -> None:
    """A model that predicts the majority class every time still scores well."""
    df = load()
    X_train, X_test, y_train, y_test = split()

    section("the class balance")
    demo("at_risk value counts", df["at_risk"].value_counts())
    demo("share that is at_risk", round(df["at_risk"].mean(), 3))

    lazy = DummyClassifier(strategy="most_frequent").fit(X_train, y_train)
    lazy_predictions = lazy.predict(X_test)
    demo("a model that always predicts 'not at risk': accuracy", round(accuracy_score(y_test, lazy_predictions), 3))
    demo("...same model: recall on the at_risk class", round(recall_score(y_test, lazy_predictions), 3))
    note("High accuracy, zero recall: this model finds literally none of the "
         "students who need help, the entire point of building it, while still "
         "looking good on the one metric that doesn't account for class imbalance.")


def section_the_confusion_matrix() -> None:
    """Every other metric here is just arithmetic on these four counts."""
    X_train, X_test, y_train, y_test = split()
    scaler = StandardScaler().fit(X_train)
    model = LogisticRegression(class_weight="balanced").fit(scaler.transform(X_train), y_train)
    predictions = model.predict(scaler.transform(X_test))

    section("the confusion matrix")
    tn, fp, fn, tp = confusion_matrix(y_test, predictions).ravel()
    demo("true negatives (correctly 'not at risk')", int(tn))
    demo("false positives (flagged at_risk, actually fine)", int(fp))
    demo("false negatives (missed -- actually at_risk, not flagged)", int(fn))
    demo("true positives (correctly caught at_risk)", int(tp))
    note("Every metric below reduces these four numbers to a single score that "
         "emphasizes a different failure mode. There is no metric that avoids a "
         "tradeoff -- the tradeoff is in the problem, not in the choice of formula.")

    OUTPUT_DIR.mkdir(exist_ok=True)
    fig, ax = plt.subplots(figsize=(4.5, 4.2))
    ConfusionMatrixDisplay(confusion_matrix(y_test, predictions), display_labels=["not at risk", "at risk"]).plot(ax=ax, colorbar=False)
    ax.set_title("confusion matrix")
    fig.tight_layout()
    fig.savefig(OUTPUT_DIR / "21_confusion_matrix.png", dpi=110)
    plt.close(fig)
    demo("saved", "outputs/21_confusion_matrix.png")
    return tn, fp, fn, tp


def section_precision_recall_f1_by_hand() -> None:
    """Compute the three metrics from the confusion matrix, then check sklearn agrees."""
    X_train, X_test, y_train, y_test = split()
    scaler = StandardScaler().fit(X_train)
    model = LogisticRegression(class_weight="balanced").fit(scaler.transform(X_train), y_train)
    predictions = model.predict(scaler.transform(X_test))
    tn, fp, fn, tp = confusion_matrix(y_test, predictions).ravel()

    section("precision: of the students flagged at_risk, how many really were?")
    precision = tp / (tp + fp)
    demo("precision = tp / (tp + fp)", round(float(precision), 3))
    demo("sklearn precision_score", round(precision_score(y_test, predictions), 3))
    note("Low precision means a lot of false alarms -- counselors spend time on "
         "students who didn't need it.")

    section("recall: of the students who really were at_risk, how many did we catch?")
    recall = tp / (tp + fn)
    demo("recall = tp / (tp + fn)", round(float(recall), 3))
    demo("sklearn recall_score", round(recall_score(y_test, predictions), 3))
    note("Low recall means real at-risk students slip through unflagged -- the "
         "costlier mistake in this particular problem.")

    section("F1: the harmonic mean, punishing a lopsided precision/recall pair")
    f1 = 2 * precision * recall / (precision + recall)
    demo("F1 = 2 * precision * recall / (precision + recall)", round(float(f1), 3))
    demo("sklearn f1_score", round(f1_score(y_test, predictions), 3))
    note("The harmonic mean is pulled down hard by whichever of the two is "
         "smaller -- a model with precision 0.9 and recall 0.1 gets F1 around "
         "0.18, not the 0.5 a plain average would give. That's deliberate: F1 "
         "punishes the model for being great at one and bad at the other.")

    section("sklearn's one-call summary")
    print(classification_report(y_test, predictions, target_names=["not at risk", "at risk"]))


def section_the_tradeoff_is_a_dial_not_a_fact() -> None:
    """Moving the decision threshold slides precision and recall in opposite directions."""
    X_train, X_test, y_train, y_test = split()
    scaler = StandardScaler().fit(X_train)
    model = LogisticRegression(class_weight="balanced").fit(scaler.transform(X_train), y_train)
    probabilities = model.predict_proba(scaler.transform(X_test))[:, 1]

    section("precision and recall at different thresholds")
    rows = []
    for threshold in [0.3, 0.4, 0.5, 0.6, 0.7]:
        predicted = (probabilities >= threshold).astype(int)
        rows.append({
            "threshold": threshold,
            "precision": round(precision_score(y_test, predicted, zero_division=0), 3),
            "recall": round(recall_score(y_test, predicted, zero_division=0), 3),
            "f1": round(f1_score(y_test, predicted, zero_division=0), 3),
        })
    demo("threshold sweep", pd.DataFrame(rows).set_index("threshold"))
    note("Raising the threshold makes the model more conservative about calling a "
         "student at_risk: precision goes up, recall goes down. There is no "
         "threshold that maximizes both at once -- the right one depends on "
         "whether a missed at-risk student or a false alarm costs more in this "
         "specific setting, which is a policy question, not a modeling one.")


SECTIONS = [
    section_why_accuracy_lies_on_imbalanced_classes,
    section_the_confusion_matrix,
    section_precision_recall_f1_by_hand,
    section_the_tradeoff_is_a_dial_not_a_fact,
]

if __name__ == "__main__":
    run(SECTIONS)
