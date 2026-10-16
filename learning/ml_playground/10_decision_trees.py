"""Decision trees on data/students_clean.csv.

Run:  .venv/bin/python 10_decision_trees.py   (run 03_data_cleaning.py first)

A decision tree asks a sequence of yes/no questions about the features --
"is attendance_pct <= 85?" -- splitting the data at each node to make the
resulting groups as pure as possible. No scaling needed, no linearity
assumed, and the splits are readable as rules. The tradeoff: left
unconstrained, a tree keeps splitting until every leaf is a single training
row, memorizing noise instead of learning a pattern.
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, export_text

from lesson_utils import demo, note, run, section

CLEAN_CSV = Path(__file__).parent / "data" / "students_clean.csv"
FEATURES = ["study_minutes", "attendance_pct", "grade"]


def load() -> pd.DataFrame:
    df = pd.read_csv(CLEAN_CSV)
    df["passed"] = (df["average_score"] >= df["average_score"].median()).astype(int)
    return df


def split():
    df = load()
    return train_test_split(df[FEATURES], df["passed"], test_size=0.2, random_state=0, stratify=df["passed"])


def section_a_shallow_tree_is_a_readable_rulebook() -> None:
    """Depth 2: the whole model fits in a few lines of if/else."""
    X_train, X_test, y_train, y_test = split()
    tree = DecisionTreeClassifier(max_depth=2, random_state=0).fit(X_train, y_train)

    section("a depth-2 tree, printed as rules")
    print(export_text(tree, feature_names=FEATURES))
    demo("train accuracy", round(accuracy_score(y_train, tree.predict(X_train)), 3))
    demo("test accuracy", round(accuracy_score(y_test, tree.predict(X_test)), 3))
    note("Every split picks the feature and cutoff that best separates passed from "
         "not-passed in the data it currently sees -- that is the whole algorithm, "
         "applied recursively. No coefficients, no scaling: the tree is invariant "
         "to monotonic transforms of a feature, unlike linear or logistic "
         "regression.")


def section_feature_importance() -> None:
    """How much each feature's splits reduced impurity, summed across the tree."""
    X_train, X_test, y_train, y_test = split()
    tree = DecisionTreeClassifier(max_depth=4, random_state=0).fit(X_train, y_train)

    section("which features did the splitting")
    importances = pd.Series(tree.feature_importances_, index=FEATURES).sort_values(ascending=False)
    demo("feature_importances_", importances.round(3))
    note("A feature with importance 0 was never chosen for a split -- not because "
         "it is useless in general, but because some other feature always won the "
         "competition for 'best split' at every node where both were candidates.")


def section_overfitting_by_depth() -> None:
    """Train accuracy climbs toward 1.0 with depth; test accuracy does not follow."""
    X_train, X_test, y_train, y_test = split()

    section("train vs. test accuracy as the tree is allowed to grow")
    rows = []
    for depth in [1, 2, 3, 5, 8, 12, None]:
        tree = DecisionTreeClassifier(max_depth=depth, random_state=0).fit(X_train, y_train)
        rows.append({
            "max_depth": depth if depth is not None else "unlimited",
            "leaves": tree.get_n_leaves(),
            "train_acc": round(accuracy_score(y_train, tree.predict(X_train)), 3),
            "test_acc": round(accuracy_score(y_test, tree.predict(X_test)), 3),
        })
    table = pd.DataFrame(rows).set_index("max_depth")
    demo("depth vs. accuracy", table)
    note("An unlimited tree keeps splitting until every leaf is pure, which usually "
         "means memorizing individual training rows (leaves roughly equal to the "
         "training set size). Train accuracy approaches 1.0 while test accuracy "
         "plateaus or drops -- the textbook overfitting signature. See "
         "12_train_val_test_overfitting.py for how to pick max_depth properly, "
         "using a validation set rather than peeking at test accuracy to choose it.")


def section_a_regression_tree() -> None:
    """The same splitting idea, predicting a number instead of a class."""
    from sklearn.metrics import mean_absolute_error
    from sklearn.tree import DecisionTreeRegressor

    df = load()
    X_train, X_test, y_train, y_test = train_test_split(
        df[FEATURES], df["average_score"], test_size=0.2, random_state=0
    )

    section("DecisionTreeRegressor: splits minimize variance, not impurity")
    shallow = DecisionTreeRegressor(max_depth=3, random_state=0).fit(X_train, y_train)
    deep = DecisionTreeRegressor(max_depth=None, random_state=0).fit(X_train, y_train)
    demo("depth=3  train/test MAE", (
        round(mean_absolute_error(y_train, shallow.predict(X_train)), 2),
        round(mean_absolute_error(y_test, shallow.predict(X_test)), 2),
    ))
    demo("unlimited depth  train/test MAE", (
        round(mean_absolute_error(y_train, deep.predict(X_train)), 2),
        round(mean_absolute_error(y_test, deep.predict(X_test)), 2),
    ))
    note("Classification trees split to make leaves purer by class; regression "
         "trees split to make leaves have lower variance in the target, and "
         "predict the mean of whatever training rows land in a leaf. Same "
         "overfitting story: the unlimited tree's train error goes near zero "
         "while its test error does not improve, or gets worse.")


SECTIONS = [
    section_a_shallow_tree_is_a_readable_rulebook,
    section_feature_importance,
    section_overfitting_by_depth,
    section_a_regression_tree,
]

if __name__ == "__main__":
    run(SECTIONS)
