"""Linear regression on data/students_clean.csv.

Run:  .venv/bin/python 08_linear_regression.py   (run 03_data_cleaning.py first)

Linear regression fits a straight line (or a flat plane, with more than one
feature) through the data by minimizing squared error. The appeal is that
every coefficient has a plain-English reading: "holding everything else
fixed, one more unit of this feature changes the prediction by this much."
This lesson fits it by hand with NumPy once, then the same model with
scikit-learn, then adds a second feature and checks whether the line's
assumptions actually hold.
"""

from __future__ import annotations

from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

from lesson_utils import demo, note, run, section

CLEAN_CSV = Path(__file__).parent / "data" / "students_clean.csv"
OUTPUT_DIR = Path(__file__).parent / "outputs"


def load() -> pd.DataFrame:
    return pd.read_csv(CLEAN_CSV)


def section_one_feature_by_hand() -> None:
    """The normal equation: the same thing LinearRegression does internally."""
    df = load()
    x = df["attendance_pct"].to_numpy()
    y = df["average_score"].to_numpy()

    section("fit y = slope * x + intercept by minimizing squared error")
    slope, intercept = np.polyfit(x, y, deg=1)
    demo("slope (points of score per % attendance)", round(float(slope), 3))
    demo("intercept", round(float(intercept), 2))
    note("np.polyfit solves the normal equation directly -- the closed-form least "
         "squares solution. No gradient descent, no iteration; for one feature "
         "this is pure linear algebra.")

    predictions = slope * x + intercept
    residuals = y - predictions
    demo("sum of squared residuals", round(float((residuals ** 2).sum()), 1))
    note("Least squares means exactly this: the slope and intercept chosen are the "
         "pair that makes the sum of squared residuals as small as possible. Any "
         "other line through this data has a larger total.")


def section_the_same_fit_with_scikit_learn() -> None:
    """LinearRegression.fit does the same minimization; check the numbers agree."""
    df = load()
    X = df[["attendance_pct"]]
    y = df["average_score"]

    section("scikit-learn's LinearRegression")
    model = LinearRegression().fit(X, y)
    demo("coefficient", round(float(model.coef_[0]), 3))
    demo("intercept", round(float(model.intercept_), 2))
    note("Matches the hand-fit numbers above -- same optimization problem, same "
         "unique solution. The library version exists for convenience (multiple "
         "features, train/test splitting, pipelines), not a different algorithm.")


def section_multiple_features() -> None:
    """Add study_minutes alongside attendance_pct; read the coefficients as a plane."""
    df = load()
    features = ["attendance_pct", "study_minutes"]
    X_train, X_test, y_train, y_test = train_test_split(
        df[features], df["average_score"], test_size=0.2, random_state=0
    )
    model = LinearRegression().fit(X_train, y_train)

    section("two features: a plane instead of a line")
    demo("coefficients", {name: round(float(c), 4) for name, c in zip(features, model.coef_)})
    demo("intercept", round(float(model.intercept_), 2))
    note("Each coefficient is read holding the other feature fixed: '+1 percentage "
         "point of attendance, at constant study_minutes, predicts this many more "
         "points of score.' That is the whole value of a linear model over a plot "
         "of raw correlations -- it separates two features that move together.")

    predictions = model.predict(X_test)
    section("evaluating the fit")
    demo("mean absolute error", round(mean_absolute_error(y_test, predictions), 2))
    demo("root mean squared error", round(mean_squared_error(y_test, predictions) ** 0.5, 2))
    demo("R-squared (variance explained)", round(r2_score(y_test, predictions), 3))
    note("RMSE penalizes large misses more than MAE does, because the error is "
         "squared before being averaged. Report both: MAE for a typical miss, "
         "RMSE to flag whether a few predictions are wildly off.")


def section_checking_the_assumptions() -> None:
    """A line is only the right tool if the residuals look like noise, not a pattern."""
    df = load()
    x = df["attendance_pct"].to_numpy()
    y = df["average_score"].to_numpy()
    slope, intercept = np.polyfit(x, y, deg=1)
    predictions = slope * x + intercept
    residuals = y - predictions

    section("residual diagnostics")
    demo("mean residual (should be ~0)", round(float(residuals.mean()), 4))
    demo("residual std", round(float(residuals.std()), 2))
    note("A linear fit always forces the mean residual to zero by construction. "
         "What matters is whether residuals are spread evenly across the range of "
         "x, with no leftover curve or funnel shape -- that's what the plot checks.")

    OUTPUT_DIR.mkdir(exist_ok=True)
    fig, (ax_fit, ax_resid) = plt.subplots(1, 2, figsize=(11, 4.5))
    ax_fit.scatter(x, y, s=10, alpha=0.4, label="students")
    order = np.argsort(x)
    ax_fit.plot(x[order], predictions[order], color="crimson", linewidth=2, label="fitted line")
    ax_fit.set(xlabel="attendance_pct", ylabel="average_score", title="fit")
    ax_fit.legend()

    ax_resid.scatter(predictions, residuals, s=10, alpha=0.4)
    ax_resid.axhline(0, color="crimson", linewidth=1.5)
    ax_resid.set(xlabel="predicted average_score", ylabel="residual", title="residuals vs. fitted")
    fig.tight_layout()
    fig.savefig(OUTPUT_DIR / "17_linear_regression_fit.png", dpi=110)
    plt.close(fig)
    demo("saved", "outputs/17_linear_regression_fit.png")
    note("A funnel shape in the right panel (residual spread growing with the "
         "prediction) would mean non-constant variance -- a sign a straight line "
         "is the wrong model, or that the target needs a transform. A random band "
         "around zero, as here, is what a reasonable linear fit looks like.")


SECTIONS = [
    section_one_feature_by_hand,
    section_the_same_fit_with_scikit_learn,
    section_multiple_features,
    section_checking_the_assumptions,
]

if __name__ == "__main__":
    run(SECTIONS)
