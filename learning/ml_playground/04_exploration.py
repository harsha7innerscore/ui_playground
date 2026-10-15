"""Exploratory data analysis on data/students_clean.csv.

Run:  .venv/bin/python 04_exploration.py   (run 03_data_cleaning.py first)

Exploration is a sequence of questions, not a sequence of function calls. Shape
and schema, then one variable at a time, then pairs, then segments, then time --
and at each step, ask what would have to be true for the number to be a lie.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from lesson_utils import demo, note, run, section

CLEAN_CSV = Path(__file__).parent / "data" / "students_clean.csv"
SCORE_COLUMNS = ["math_score", "science_score", "english_score"]

pd.set_option("display.width", 100)
pd.set_option("display.max_columns", 25)


def load() -> pd.DataFrame:
    df = pd.read_csv(CLEAN_CSV, parse_dates=["enrolled_on"])
    for column in ["city", "device", "gender", "school", "study_band", "performance"]:
        df[column] = df[column].astype("category")
    return df


def text_histogram(series: pd.Series, bins: int = 12, width: int = 44) -> str:
    """A histogram you can read in a terminal, before you open matplotlib."""
    counts, edges = np.histogram(series.dropna(), bins=bins)
    scale = width / counts.max() if counts.max() else 0
    rows = [
        f"{edges[i]:7.1f} - {edges[i + 1]:7.1f} | {'#' * int(round(count * scale)):<{width}} {count}"
        for i, count in enumerate(counts)
    ]
    return "\n".join(rows)


def section_first_look() -> None:
    """Shape, schema, and whether the file is what the previous step promised."""
    df = load()
    section("shape and schema")
    demo("rows x columns", df.shape)
    demo("dtypes", df.dtypes.value_counts())
    demo("memory", f"{df.memory_usage(deep=True).sum() / 1024:.1f} KB")
    demo("columns", list(df.columns))

    section("sample rows -- head, tail and a random slice")
    demo("head(3)", df.head(3)[["student_id", "city", "grade", "study_minutes", "average_score"]])
    demo("sample(3, random_state=0)", df.sample(3, random_state=0)[["student_id", "school", "performance"]])

    section("integrity re-check")
    demo("missing cells", int(df.isna().sum().sum()))
    demo("duplicate ids", int(df["student_id"].duplicated().sum()))
    demo("rows carrying an imputed value", int(df.filter(like="_imputed").any(axis=1).sum()))
    note("Imputed values were invented by the cleaning step. Any finding that "
         "depends on them has to be re-checked on the un-imputed subset.")


def section_one_variable_numeric() -> None:
    """Centre, spread, shape. describe() is the start of the answer, not the end."""
    df = load()
    section("describe")
    demo("numeric summary", df[["study_minutes", "attendance_pct", *SCORE_COLUMNS, "average_score"]]
         .describe().round(2))

    section("centre and spread, separately")
    minutes = df["study_minutes"]
    demo("mean / median / mode", (
        round(minutes.mean(), 1),
        round(minutes.median(), 1),
        float(minutes.mode().iloc[0]),
    ))
    demo("std / IQR / range", (
        round(minutes.std(), 1),
        round(minutes.quantile(0.75) - minutes.quantile(0.25), 1),
        round(minutes.max() - minutes.min(), 1),
    ))
    demo("deciles", minutes.quantile(np.arange(0.1, 1.0, 0.1)).round(0).to_dict())

    section("shape")
    demo("skew", round(minutes.skew(), 3))
    demo("kurtosis", round(minutes.kurtosis(), 3))
    note("Positive skew means a long right tail: mean > median, and the mean is the "
         "wrong summary to quote. Report the median for study_minutes.")
    demo("study_minutes", text_histogram(minutes))
    demo("average_score (roughly symmetric)", text_histogram(df["average_score"]))


def section_one_variable_categorical() -> None:
    """Counts, shares, and whether any category is too small to trust."""
    df = load()
    section("frequency")
    demo("city", df["city"].value_counts())
    demo("device share", df["device"].value_counts(normalize=True).mul(100).round(1))
    demo("grade", df["grade"].value_counts().sort_index())

    section("ordered categories")
    demo("study_band", df["study_band"].value_counts().reindex(["<1h", "1-3h", "3-6h", "6h+"]))
    demo("performance", df["performance"].value_counts()
         .reindex(["needs work", "fair", "good", "excellent"]))

    section("small groups are where false findings come from")
    sizes = df.groupby(["city", "grade"], observed=True).size().sort_values()
    demo("smallest city x grade cells", sizes.head(5))
    note("A cell of 8 students has a standard error wide enough to swallow almost "
         "any difference. Report n alongside every group mean.")


def section_two_variables() -> None:
    """Numeric vs numeric is correlation; numeric vs categorical is a group
    comparison; categorical vs categorical is a cross-tab."""
    df = load()
    section("numeric vs numeric")
    numeric = df[["study_minutes", "attendance_pct", *SCORE_COLUMNS, "average_score"]]
    demo("Pearson correlation (linear)", numeric.corr().round(2))
    demo("Spearman (monotonic, rank-based, outlier-resistant)",
         numeric.corr(method="spearman").round(2))
    demo("strongest pairs", (
        numeric.corr()
        .where(np.triu(np.ones(numeric.shape[1], dtype=bool), k=1))
        .stack()
        .sort_values(ascending=False)
        .head(5)
        .round(3)
    ))
    note("Correlation measures linear association only, it is not causation, and it "
         "is distorted by outliers -- compare Pearson against Spearman to see that.")

    section("numeric vs categorical")
    by_band = df.groupby("study_band", observed=True).agg(
        students=("student_id", "count"),
        median_score=("average_score", "median"),
        mean_score=("average_score", "mean"),
        spread=("average_score", "std"),
    ).round(2)
    demo("average_score by study_band", by_band)
    demo("gap, lowest to highest band",
         round(by_band["median_score"].iloc[-1] - by_band["median_score"].iloc[0], 2))

    section("categorical vs categorical")
    table = pd.crosstab(df["study_band"], df["performance"])
    demo("counts", table)
    demo("row percentages", pd.crosstab(df["study_band"], df["performance"], normalize="index")
         .mul(100).round(1))

    section("a bivariate relationship, binned")
    binned = df.groupby(pd.cut(df["attendance_pct"], bins=[0, 70, 80, 90, 95, 100]), observed=True)
    demo("average_score by attendance band", binned["average_score"].agg(["count", "mean"]).round(2))


def section_segments() -> None:
    """Slice the same question by every grouping you have, and look for the slice
    where the headline stops being true."""
    df = load()
    section("one metric, every segment")
    for key in ["city", "school", "device", "gender", "grade"]:
        summary = df.groupby(key, observed=True).agg(
            n=("student_id", "count"), avg=("average_score", "mean")
        ).round(2).sort_values("avg", ascending=False)
        demo(f"average_score by {key}", summary)

    section("two keys at once")
    pivot = pd.pivot_table(
        df, values="average_score", index="city", columns="study_band",
        aggfunc="mean", observed=True,
    ).round(1)
    demo("city x study_band", pivot)
    demo("where the pattern is strongest", pivot.max(axis=1).sub(pivot.min(axis=1)).round(1)
         .sort_values(ascending=False))

    section("rank within group with transform")
    df["rank_in_school"] = df.groupby("school", observed=True)["average_score"].rank(
        ascending=False, method="min"
    )
    demo("top of each school", df[df["rank_in_school"] == 1]
         [["school", "student_id", "average_score"]].sort_values("school"))

    section("the aggregate can reverse inside the groups")
    note("Simpson's paradox: a difference that holds overall can vanish or flip in "
         "every subgroup, when group sizes differ. Always check the headline "
         "against the per-group breakdown before reporting it.")
    overall = df.groupby("device", observed=True)["average_score"].mean().round(2)
    within = df.groupby(["grade", "device"], observed=True)["average_score"].mean().unstack().round(2)
    demo("overall by device", overall)
    demo("by grade and device", within)


def section_time() -> None:
    """Anything with a date gets a trend, a seasonality check, and a cohort view."""
    df = load().sort_values("enrolled_on")
    section("the time range")
    demo("first / last enrolment", (df["enrolled_on"].min().date(), df["enrolled_on"].max().date()))
    demo("span", df["enrolled_on"].max() - df["enrolled_on"].min())

    section("resample to a regular frequency")
    monthly = df.set_index("enrolled_on").resample("ME").agg(
        enrolments=("student_id", "count"), avg_score=("average_score", "mean")
    ).round(2)
    demo("monthly", monthly)

    section("smooth a noisy series before reading a trend into it")
    demo("3-month rolling mean of enrolments", monthly["enrolments"].rolling(3).mean().round(2))
    demo("month-on-month change", monthly["enrolments"].pct_change().mul(100).round(1))

    section("cohorts: group by when they joined, compare how they do")
    cohort = df.assign(cohort=df["enrolled_on"].dt.to_period("Q").astype("string")).groupby(
        "cohort", observed=True
    ).agg(n=("student_id", "count"), avg_score=("average_score", "mean"),
          avg_minutes=("study_minutes", "median")).round(1)
    demo("by enrolment quarter", cohort)
    note("Later cohorts have had less time in the product. A cohort comparison that "
         "ignores tenure measures tenure, not quality.")


def section_question_the_finding() -> None:
    """The part that is usually skipped. Every headline number gets challenged
    before it leaves the script."""
    df = load()
    headline = df[["study_minutes", "average_score"]].corr().iloc[0, 1]
    section("the headline")
    demo("corr(study_minutes, average_score)", round(headline, 3))

    section("challenge 1 -- is it an artifact of the imputed values?")
    real = df[~df[["study_minutes_imputed", "math_score_imputed",
                   "science_score_imputed", "english_score_imputed"]].any(axis=1)]
    demo("rows with no imputation", len(real))
    demo("same correlation there", round(real[["study_minutes", "average_score"]].corr().iloc[0, 1], 3))

    section("challenge 2 -- what are the outliers doing to it?")
    trimmed = df[~df["is_outlier_study"]]
    demo("rows after dropping flagged outliers", len(trimmed))
    demo("correlation without them",
         round(trimmed[["study_minutes", "average_score"]].corr().iloc[0, 1], 3))
    demo("Spearman on the full data (rank-based)",
         round(df[["study_minutes", "average_score"]].corr(method="spearman").iloc[0, 1], 3))
    note("The correlation roughly triples once the extreme-study rows are removed, "
         "and rank-based Spearman on the full data lands near the trimmed value. "
         "So the outliers were not inventing the relationship -- they were hiding "
         "it. A handful of students study enormously without scoring higher, which "
         "flattens a line fitted through everyone. Outliers can suppress a signal "
         "just as easily as they manufacture one; the fix is to look, not to assume.")

    section("challenge 3 -- does it survive inside every segment?")
    per_grade = df.groupby("grade", observed=True).apply(
        lambda g: g["study_minutes"].corr(g["average_score"]), include_groups=False
    ).round(3)
    per_grade_trimmed = trimmed.groupby("grade", observed=True).apply(
        lambda g: g["study_minutes"].corr(g["average_score"]), include_groups=False
    ).round(3)
    demo("within each grade, full data", per_grade)
    demo("within each grade, outliers removed", per_grade_trimmed)
    demo("sign consistent across grades", bool((per_grade > 0).all()))
    note("Positive in every grade either way, so the association is not an artifact "
         "of mixing grades together.")

    section("challenge 4 -- is a third variable doing the work?")
    demo("corr(attendance_pct, average_score)",
         round(df[["attendance_pct", "average_score"]].corr().iloc[0, 1], 3))
    demo("corr(study_minutes, attendance_pct)",
         round(df[["study_minutes", "attendance_pct"]].corr().iloc[0, 1], 3))
    note("Here the two predictors are themselves uncorrelated, so neither is "
         "confounding the other -- they carry separate information about the score. "
         "Had they been correlated, neither simple correlation would have been the "
         "whole story, and disentangling them needs a model rather than more "
         "exploration.")

    section("what the exploration actually supports")
    for line in [
        "study time and average score move together, in every grade, and with the "
        "imputed rows excluded",
        "the headline correlation on the full data understates it: the extreme-study "
        "rows flatten the line, and both the trimmed and the rank-based figures are "
        "far higher",
        "attendance predicts the score too, independently of study time",
        "quote the band medians next to the correlation -- a coefficient alone says "
        "nothing about how many points separate a 1-hour student from a 6-hour one",
        "nothing here establishes direction or cause",
    ]:
        note(f"- {line}")


SECTIONS = [
    section_first_look,
    section_one_variable_numeric,
    section_one_variable_categorical,
    section_two_variables,
    section_segments,
    section_time,
    section_question_the_finding,
]

if __name__ == "__main__":
    run(SECTIONS)
