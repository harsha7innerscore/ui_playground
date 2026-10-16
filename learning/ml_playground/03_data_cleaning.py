"""Data cleaning: turn data/students_raw.csv into data/students_clean.csv.

Run:  .venv/bin/python 03_data_cleaning.py

Order matters. Audit before touching anything, drop duplicates before computing
any statistic, make types correct before judging values, and only then decide
what to do about what is missing or impossible. Each step prints what it
changed, so the cost of the cleaning is visible rather than assumed.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from lesson_utils import demo, note, run, section

DATA_DIR = Path(__file__).parent / "data"
RAW_CSV = DATA_DIR / "students_raw.csv"
CLEAN_CSV = DATA_DIR / "students_clean.csv"

SCORE_COLUMNS = ["math_score", "science_score", "english_score"]
NUMERIC_COLUMNS = ["study_minutes", "attendance_pct", *SCORE_COLUMNS]
MISSING_SENTINELS = ["N/A", "n/a", "null", "NULL", "-", "--", "", " ", "   ", "NaN", "none"]
DATE_FORMATS = ["%Y-%m-%d %H:%M:%S", "%Y-%m-%d", "%d/%m/%Y", "%d-%b-%Y", "%Y/%m/%d"]

pd.set_option("display.width", 100)
pd.set_option("display.max_columns", 20)


def load_raw() -> pd.DataFrame:
    """Read with sentinels declared, but leave every type alone for now."""
    return pd.read_csv(RAW_CSV, na_values=MISSING_SENTINELS, keep_default_na=True, skipinitialspace=True)


def section_audit() -> None:
    """Never clean what you have not measured. This is the report you write
    before deciding anything, and the baseline you check the result against."""
    df = load_raw()
    section("size and types")
    demo("shape", df.shape)
    demo("dtypes", df.dtypes)
    note("Any column that should be numeric but reads as a text dtype (str on pandas 3, "
         "object on pandas 2) is holding text somewhere.")

    section("completeness")
    missing = pd.DataFrame({
        "missing": df.isna().sum(),
        "pct": (df.isna().mean() * 100).round(1),
    })
    demo("per column", missing[missing["missing"] > 0])
    demo("rows with at least one gap", int(df.isna().any(axis=1).sum()))

    section("duplication")
    demo("fully identical rows", int(df.duplicated().sum()))
    demo("repeated student_id", int(df["student_id"].duplicated().sum()))

    section("category hygiene")
    for column in ["city", "device", "gender"]:
        demo(f"{column} distinct values", sorted(map(repr, df[column].dropna().unique())))
    note("Leading spaces and casing make one real category look like five.")

    section("the text hiding in numeric columns")
    for column in NUMERIC_COLUMNS:
        offenders = df[column][pd.to_numeric(df[column], errors="coerce").isna() & df[column].notna()]
        demo(f"{column}: {len(offenders)} unparseable", offenders.head(3).tolist())

    section("range checks on what does parse")
    numeric = df[NUMERIC_COLUMNS].apply(pd.to_numeric, errors="coerce")
    demo("min / max", numeric.agg(["min", "max"]).round(1))
    note("Scores of 999, negative study minutes and grade 0 are not outliers -- they "
         "are impossible, which makes them a type of missing value.")


def clean_text(series: pd.Series) -> pd.Series:
    """Trim, collapse inner whitespace, and lowercase for comparison."""
    return (
        series.astype("string")
        .str.strip()
        .str.replace(r"\s+", " ", regex=True)
        .str.lower()
        .replace({"": pd.NA})
    )


def to_number(series: pd.Series) -> pd.Series:
    """Strip the decoration people type into numeric fields, then coerce.

    errors='coerce' is the important half: anything still unparseable becomes
    NaN instead of raising, so one bad cell cannot abort the whole pipeline.
    """
    cleaned = (
        series.astype("string")
        .str.replace(",", "", regex=False)
        .str.replace("%", "", regex=False)
        .str.replace(r"[a-zA-Z]", "", regex=True)
        .str.strip()
    )
    return pd.to_numeric(cleaned, errors="coerce")


def parse_mixed_dates(series: pd.Series, formats: list[str] = DATE_FORMATS) -> pd.Series:
    """Try each known format in turn and keep the first that parses each value.

    Safer than format='mixed': dateutil would guess at '2025/05/06', and a wrong
    guess is worse than a NaT you can count.
    """
    text = series.astype("string").str.strip()
    parsed = pd.Series(pd.NaT, index=series.index, dtype="datetime64[ns]")
    for fmt in formats:
        remaining = parsed.isna() & text.notna()
        if not remaining.any():
            break
        attempt = pd.to_datetime(text[remaining], format=fmt, errors="coerce")
        parsed.loc[remaining] = attempt
    return parsed


def section_deduplicate() -> None:
    """Drop exact repeats first: every later statistic is wrong while they remain."""
    df = load_raw()
    before = len(df)
    deduped = df.drop_duplicates()
    section("exact duplicates")
    demo("rows before / after", (before, len(deduped)))
    demo("mean math_score before", round(pd.to_numeric(df["math_score"], errors="coerce").mean(), 3))
    demo("mean math_score after", round(pd.to_numeric(deduped["math_score"], errors="coerce").mean(), 3))

    section("duplicates on a subset of keys")
    note("When only some columns identify a record, name them. keep='first' wins "
         "when rows are equivalent; sort first when the newest row should win.")
    demo(
        "drop_duplicates(subset=['student_id'], keep='first')",
        len(deduped.drop_duplicates(subset=["student_id"], keep="first")),
    )
    demo("inspect what would be dropped", deduped[deduped.duplicated(subset=["student_id"], keep=False)]
         .sort_values("student_id")[["student_id", "name", "math_score"]].head(4))


def section_standardize() -> None:
    """Text and types. Nothing about values is decided yet -- this step only
    makes the data comparable."""
    df = load_raw().drop_duplicates()

    section("categorical text")
    before = df["city"].dropna().nunique()
    df["city"] = clean_text(df["city"]).str.title()
    df["device"] = clean_text(df["device"])
    df["gender"] = clean_text(df["gender"]).map(
        {"f": "female", "female": "female", "m": "male", "male": "male"}
    )
    df["name"] = df["name"].astype("string").str.strip()
    demo("city distinct before / after", (before, df["city"].dropna().nunique()))
    demo("city values", sorted(df["city"].dropna().unique().tolist()))
    demo("device values", sorted(df["device"].dropna().unique().tolist()))
    demo("gender values", sorted(df["gender"].dropna().unique().tolist()))
    note("An explicit dict for gender beats .str.lower() alone: unknown spellings "
         "become NaN and show up in the audit instead of becoming a new category.")

    section("numeric columns")
    for column in NUMERIC_COLUMNS:
        parsed = to_number(df[column])
        rescued = int(parsed.notna().sum() - pd.to_numeric(df[column], errors="coerce").notna().sum())
        demo(f"{column}: values rescued from text", rescued)
        df[column] = parsed
    demo("dtypes now", df[NUMERIC_COLUMNS].dtypes)

    section("dates")
    df["enrolled_on"] = parse_mixed_dates(df["enrolled_on"])
    demo("parsed", df["enrolled_on"].notna().sum())
    demo("unparseable (NaT)", int(df["enrolled_on"].isna().sum()))
    demo("range", (df["enrolled_on"].min(), df["enrolled_on"].max()))
    demo("derived parts", df["enrolled_on"].dt.to_period("M").value_counts().sort_index().head(4))


def section_impossible_values() -> None:
    """Domain rules, applied as masks. An impossible value is more dangerous than
    a missing one, because it survives every automatic check."""
    df = standardized_frame()

    section("the rules")
    rules = {
        "score outside 0-100": df[SCORE_COLUMNS].gt(100).any(axis=1) | df[SCORE_COLUMNS].lt(0).any(axis=1),
        "negative study_minutes": df["study_minutes"] < 0,
        "attendance outside 0-100": ~df["attendance_pct"].between(0, 100) & df["attendance_pct"].notna(),
        "grade outside 1-12": ~df["grade"].between(1, 12),
        "enrolled in the future": df["enrolled_on"] > pd.Timestamp.now(),
    }
    demo("rows violating each rule", {name: int(mask.sum()) for name, mask in rules.items()})

    section("replace with NaN rather than delete the row")
    for column in SCORE_COLUMNS:
        df.loc[~df[column].between(0, 100), column] = np.nan
    df.loc[df["study_minutes"] < 0, "study_minutes"] = np.nan
    df.loc[~df["grade"].between(1, 12), "grade"] = np.nan
    demo("score range now", df[SCORE_COLUMNS].agg(["min", "max"]))
    demo("study_minutes min", df["study_minutes"].min())
    note("The rest of that row is probably fine. Nulling one cell keeps the other "
         "columns usable; dropping the row throws away good data with the bad.")


def section_missing_strategy() -> None:
    """Three options: drop the row, drop the column, or fill. Pick per column,
    based on how much is missing and whether the gap is informative."""
    df = impossible_removed_frame()
    section("where the gaps are now")
    demo("missing", df.isna().sum()[lambda s: s > 0])
    demo("share of rows with any gap", f"{df.isna().any(axis=1).mean():.1%}")

    section("option 1 -- drop")
    demo("dropna() on everything keeps", f"{len(df.dropna())} of {len(df)} rows")
    demo("dropna(subset=['math_score']) keeps", len(df.dropna(subset=["math_score"])))
    demo("thresh: keep rows with >= 11 non-null", len(df.dropna(thresh=11)))
    note("Dropping is honest and cheap when gaps are rare and random. At 7% of rows "
         "across a dozen columns it quietly deletes a third of the dataset.")

    section("option 2 -- fill with a constant or a statistic")
    demo("median of math_score", round(df["math_score"].median(), 2))
    demo("mean vs median on skewed study_minutes", (
        round(df["study_minutes"].mean(), 1),
        round(df["study_minutes"].median(), 1),
    ))
    note("Use the median for skewed numbers: a few 1,300-minute students drag the "
         "mean upward and the fill would inherit that bias.")

    section("option 3 -- fill from the group the row belongs to")
    by_grade = df.groupby("grade")["math_score"].transform("median")
    filled = df["math_score"].fillna(by_grade)
    demo("per-grade medians", df.groupby("grade")["math_score"].median().round(1))
    demo("still missing after group fill", int(filled.isna().sum()))

    section("what this pipeline does")
    note("Numeric gaps are filled with the grade-level median, categorical gaps get "
         "an explicit 'unknown' category, and rows missing an identifier are dropped. "
         "Every filled cell is recorded in a *_imputed flag column so later analysis "
         "can exclude them.")
    result = apply_missing_policy(df)
    demo("missing after policy", int(result.isna().sum().sum()))
    demo("imputation flags", result.filter(like="_imputed").sum())


def section_outliers() -> None:
    """A real outlier is an extreme but genuine value. Detect it, decide
    deliberately, and never drop it just for being inconvenient."""
    df = apply_missing_policy(impossible_removed_frame())
    minutes = df["study_minutes"]

    section("IQR rule (robust, assumes nothing about the distribution)")
    q1, q3 = minutes.quantile([0.25, 0.75])
    iqr = q3 - q1
    low, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr
    outliers = minutes[(minutes < low) | (minutes > high)]
    demo("Q1 / Q3 / IQR", (round(q1, 1), round(q3, 1), round(iqr, 1)))
    demo("fences", (round(low, 1), round(high, 1)))
    demo("flagged", f"{len(outliers)} rows ({len(outliers) / len(df):.1%})")
    demo("largest values", sorted(outliers.round(0).tolist(), reverse=True)[:6])

    section("z-score rule (assumes roughly normal, and the outliers skew it)")
    z = (minutes - minutes.mean()) / minutes.std()
    demo("|z| > 3 count", int((z.abs() > 3).sum()))
    note("The mean and standard deviation are themselves pulled by the outliers, so "
         "z-scores under-report them. Prefer the IQR rule on skewed data.")

    section("three responses")
    demo("keep and flag", df.assign(long_session=minutes > high)["long_session"].sum())
    capped = minutes.clip(lower=low, upper=high)
    demo("winsorize (clip to the fences): new max", round(capped.max(), 1))
    demo("remove: rows left", len(df[minutes <= high]))
    note("This pipeline keeps and flags. The long-session students are real; the "
         "visualization script shows them, and a log scale handles the skew.")


def standardized_frame() -> pd.DataFrame:
    """Steps 1-3: deduplicate, standardize text, parse numbers and dates."""
    df = load_raw().drop_duplicates().reset_index(drop=True)
    df["name"] = df["name"].astype("string").str.strip()
    df["city"] = clean_text(df["city"]).str.title()
    df["school"] = clean_text(df["school"]).str.title()
    df["device"] = clean_text(df["device"])
    df["gender"] = clean_text(df["gender"]).map(
        {"f": "female", "female": "female", "m": "male", "male": "male"}
    )
    for column in NUMERIC_COLUMNS:
        df[column] = to_number(df[column])
    df["grade"] = pd.to_numeric(df["grade"], errors="coerce")
    df["enrolled_on"] = parse_mixed_dates(df["enrolled_on"])
    return df


def impossible_removed_frame() -> pd.DataFrame:
    """Step 4: domain rules turn impossible values into NaN."""
    df = standardized_frame()
    for column in SCORE_COLUMNS:
        df.loc[~df[column].between(0, 100), column] = np.nan
    df.loc[df["study_minutes"] < 0, "study_minutes"] = np.nan
    df.loc[~df["attendance_pct"].between(0, 100), "attendance_pct"] = np.nan
    df.loc[~df["grade"].between(1, 12), "grade"] = np.nan
    df.loc[df["enrolled_on"] > pd.Timestamp.now(), "enrolled_on"] = pd.NaT
    return df


def apply_missing_policy(df: pd.DataFrame) -> pd.DataFrame:
    """Step 5: fill what can be filled, flag every fill, drop what cannot."""
    df = df.dropna(subset=["student_id", "grade"]).copy()

    for column in NUMERIC_COLUMNS:
        df[f"{column}_imputed"] = df[column].isna()
        group_median = df.groupby("grade")[column].transform("median")
        df[column] = df[column].fillna(group_median).fillna(df[column].median())

    for column in ["city", "device", "gender", "school"]:
        df[column] = df[column].fillna("unknown")

    df["enrolled_on"] = df["enrolled_on"].fillna(df["enrolled_on"].median())
    return df


def finalize(df: pd.DataFrame) -> pd.DataFrame:
    """Step 6: derived columns, final dtypes, column order."""
    df = df.copy()
    df["grade"] = df["grade"].astype("int8")
    for column in ["city", "device", "gender", "school"]:
        df[column] = df[column].astype("category")
    df["study_minutes"] = df["study_minutes"].round(0)
    df["attendance_pct"] = df["attendance_pct"].round(1)
    df[SCORE_COLUMNS] = df[SCORE_COLUMNS].round(1)

    df["average_score"] = df[SCORE_COLUMNS].mean(axis=1).round(1)
    df["study_hours"] = (df["study_minutes"] / 60).round(2)
    df["study_band"] = pd.cut(
        df["study_minutes"],
        bins=[-0.1, 60, 180, 360, np.inf],
        labels=["<1h", "1-3h", "3-6h", "6h+"],
    )
    df["performance"] = pd.cut(
        df["average_score"],
        bins=[-0.1, 50, 70, 85, 100],
        labels=["needs work", "fair", "good", "excellent"],
    )
    df["enrolled_month"] = df["enrolled_on"].dt.to_period("M").astype("string")
    df["is_outlier_study"] = df["study_minutes"] > df["study_minutes"].quantile(0.75) + 1.5 * (
        df["study_minutes"].quantile(0.75) - df["study_minutes"].quantile(0.25)
    )
    return df.sort_values("student_id").reset_index(drop=True)


def validate(df: pd.DataFrame) -> list[str]:
    """Assertions that must hold on the way out. Cleaning without a contract is
    just rearranging the mess."""
    checks = {
        "no duplicate student rows": bool(df["student_id"].is_unique),
        "no missing in key columns": bool(df[NUMERIC_COLUMNS + ["grade", "city"]].notna().all().all()),
        "scores within 0-100": bool(df[SCORE_COLUMNS].ge(0).all().all() and df[SCORE_COLUMNS].le(100).all().all()),
        "attendance within 0-100": bool(df["attendance_pct"].between(0, 100).all()),
        "study_minutes non-negative": bool((df["study_minutes"] >= 0).all()),
        "grade within 1-12": bool(df["grade"].between(1, 12).all()),
        "enrolment not in the future": bool((df["enrolled_on"] <= pd.Timestamp.now()).all()),
        "city is standardized": set(df["city"].unique()) <= {
            "Hyderabad", "Bengaluru", "Chennai", "Pune", "Delhi", "unknown",
        },
    }
    return [f"{'PASS' if ok else 'FAIL'}  {name}" for name, ok in checks.items()]


def section_pipeline() -> None:
    """The whole thing, end to end, with a before/after accounting and the
    cleaned file written to disk for scripts 04 and 05."""
    raw = load_raw()
    clean = finalize(apply_missing_policy(impossible_removed_frame()))

    section("before and after")
    demo("rows", (len(raw), len(clean)))
    demo("columns", (raw.shape[1], clean.shape[1]))
    demo("missing cells", (int(raw.isna().sum().sum()), int(clean.isna().sum().sum())))
    demo("numeric columns typed as object", (
        int(sum(raw[c].dtype == object for c in NUMERIC_COLUMNS)),
        int(sum(clean[c].dtype == object for c in NUMERIC_COLUMNS)),
    ))

    section("final schema")
    demo("dtypes", clean.dtypes)
    demo("head(3)", clean.head(3))

    section("validation")
    for line in validate(clean):
        print(f"  {line}")

    section("imputation cost")
    demo("cells filled", clean.filter(like="_imputed").sum())
    demo("rows with any imputed value", int(clean.filter(like="_imputed").any(axis=1).sum()))

    clean.to_csv(CLEAN_CSV, index=False)
    section("output")
    demo("written", f"{CLEAN_CSV.name}  rows={len(clean)}  cols={clean.shape[1]}")


SECTIONS = [
    section_audit,
    section_deduplicate,
    section_standardize,
    section_impossible_values,
    section_missing_strategy,
    section_outliers,
    section_pipeline,
]

if __name__ == "__main__":
    run(SECTIONS)
