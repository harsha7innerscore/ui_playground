"""Supervised vs. unsupervised learning on data/students_clean.csv.

Run:  .venv/bin/python 06_supervised_vs_unsupervised.py   (run 03_data_cleaning.py first)

Supervised learning fits a model to (features, known answer) pairs and is
judged by how well it predicts the answer for students it never saw.
Unsupervised learning gets only the features -- no answer column exists --
and has to find structure (groups, patterns) on its own. Same dataset, two
completely different kinds of question.
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd
from sklearn.cluster import KMeans
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from lesson_utils import demo, note, run, section

CLEAN_CSV = Path(__file__).parent / "data" / "students_clean.csv"
FEATURES = ["study_minutes", "attendance_pct"]


def load() -> pd.DataFrame:
    return pd.read_csv(CLEAN_CSV)


def section_the_dataset_has_both_kinds_of_question() -> None:
    """Same table, two different problems depending on what you treat as the target."""
    df = load()
    section("the columns")
    demo("features available", FEATURES)
    demo("a label that exists in the data", "average_score (we know it for every student)")
    note("Because average_score is already known for every row, predicting it is a "
         "supervised problem: the correct answer is right there to learn from and "
         "to check against. If no such column existed -- say we only had behaviour "
         "data and no scores at all -- grouping students by behaviour would be "
         "unsupervised: there is no 'correct' grouping to check against.")


def section_supervised_learns_from_labelled_examples() -> None:
    """Fit a model on (features, average_score) pairs, then score it on unseen students."""
    df = load()
    X_train, X_test, y_train, y_test = train_test_split(
        df[FEATURES], df["average_score"], test_size=0.2, random_state=0
    )
    section("supervised: predict a known label")
    demo("rows used to fit the model", len(X_train))
    demo("rows held back to judge it", len(X_test))

    model = LinearRegression().fit(X_train, y_train)
    demo("learned coefficients", {name: round(float(c), 3) for name, c in zip(FEATURES, model.coef_)})
    demo("R-squared on unseen students", round(model.score(X_test, y_test), 3))
    note("The model never saw the test students' scores during training. R-squared "
         "here answers a concrete question: how well does this generalize? That "
         "question only makes sense because we had ground truth to compare against -- "
         "the negative value says these two features barely predict average_score on "
         "this split; see 08_linear_regression.py for a closer look at the fit.")


def section_unsupervised_finds_structure_without_labels() -> None:
    """Group students by behaviour alone -- average_score is not shown to the algorithm."""
    df = load()
    section("unsupervised: find structure, no target column involved")
    scaled = StandardScaler().fit_transform(df[FEATURES])
    kmeans = KMeans(n_clusters=3, random_state=0, n_init=10).fit(scaled)
    df = df.assign(cluster=kmeans.labels_)
    demo("cluster sizes", df["cluster"].value_counts().sort_index())

    profile = df.groupby("cluster")[FEATURES].mean().round(1)
    demo("what each cluster looks like (behaviour only)", profile)
    note("KMeans only ever saw study_minutes and attendance_pct. It has no notion "
         "of 'correct' clusters -- there is no label to be right or wrong about.")

    section("checking the clusters against a label after the fact")
    cross_check = df.groupby("cluster")["average_score"].agg(["count", "mean"]).round(2)
    demo("average_score per cluster (looked up afterwards, not used to form them)", cross_check)
    note("The clusters line up with average_score reasonably well even though the "
         "score was withheld from the algorithm -- behaviour and outcome are "
         "related. That correspondence is a finding to report, not something the "
         "unsupervised method assumed going in. It could just as easily have come "
         "back scrambled.")


def section_key_differences() -> None:
    """A direct comparison, stated plainly."""
    section("supervised vs unsupervised")
    rows = [
        ("input", "features + known answer (label)", "features only"),
        ("goal", "predict the label for new data", "discover groups or structure"),
        ("evaluation", "compare predictions to true labels", "no ground truth to score against"),
        ("example here", "LinearRegression -> average_score", "KMeans -> behaviour clusters"),
        ("needs a labelled dataset?", "yes", "no"),
    ]
    width = max(len(r[0]) for r in rows)
    for name, sup, unsup in rows:
        print(f"  {name:<{width}}  supervised: {sup}")
        print(f"  {' ' * width}  unsupervised: {unsup}")

    section("when to reach for which")
    for line in [
        "you have historical outcomes and want to predict them for new cases -> supervised",
        "you want to explore a dataset for natural groupings with no target in mind -> unsupervised",
        "you have a target but suspect there are sub-populations within it -> both: cluster "
        "first, then consider a separate supervised model per cluster",
    ]:
        note(f"- {line}")


SECTIONS = [
    section_the_dataset_has_both_kinds_of_question,
    section_supervised_learns_from_labelled_examples,
    section_unsupervised_finds_structure_without_labels,
    section_key_differences,
]

if __name__ == "__main__":
    run(SECTIONS)
