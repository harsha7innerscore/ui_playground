"""pandas fundamentals: Series, DataFrame, selection, grouping, joining.

Run:  .venv/bin/python 02_pandas_basics.py

A Series is a NumPy array plus an index. A DataFrame is a dict of Series that
share one index. Almost every confusing pandas behaviour comes from the index:
it is what alignment, joins, grouping and reshaping all key on.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from lesson_utils import demo, note, run, section

RAW_CSV = Path(__file__).parent / "data" / "students_raw.csv"

pd.set_option("display.width", 100)
pd.set_option("display.max_columns", 20)


def toy_frame() -> pd.DataFrame:
    """A small, clean frame -- big enough to show behaviour, small enough to print."""
    return pd.DataFrame(
        {
            "student": ["Asha", "Bilal", "Chen", "Divya", "Elan", "Farah"],
            "city": ["Pune", "Delhi", "Pune", "Chennai", "Delhi", "Chennai"],
            "grade": [8, 9, 8, 10, 9, 10],
            "math": [78, 55, 92, 67, 88, 45],
            "science": [81, 62, 85, 70, 90, 52],
            "study_minutes": [210, 95, 320, 140, 280, 60],
        }
    )


def section_series() -> None:
    """A Series is one column: values + an index + a name + a dtype."""
    s = pd.Series([78, 55, 92, 67], index=["Asha", "Bilal", "Chen", "Divya"], name="math")
    section("anatomy")
    demo("s", s)
    demo("s.values (a NumPy array)", s.values)
    demo("s.index", list(s.index))
    demo("s.name / s.dtype", (s.name, s.dtype))

    section("label lookup vs position lookup")
    demo("s['Chen']", s["Chen"])
    demo("s.iloc[2]", s.iloc[2])
    demo("s[['Asha', 'Divya']]", s[["Asha", "Divya"]])

    section("vectorized, like NumPy")
    demo("s + 5", s + 5)
    demo("s[s > 70]", s[s > 70])
    demo("s.mean() / s.max() / s.idxmax()", (s.mean(), s.max(), s.idxmax()))

    section("arithmetic aligns on the index, it does not zip positionally")
    bonus = pd.Series([10, 10], index=["Chen", "Asha"])
    demo("bonus", bonus)
    demo("s + bonus  # unmatched labels become NaN", s + bonus)
    demo("s.add(bonus, fill_value=0)", s.add(bonus, fill_value=0))
    note("Index alignment is the feature people fight hardest before they rely on it.")


def section_dataframe_basics() -> None:
    """Construction and the four inspection calls worth making on any new frame."""
    df = toy_frame()
    section("the frame")
    demo("df", df)

    section("inspect")
    demo("df.shape", df.shape)
    demo("df.columns", list(df.columns))
    demo("df.dtypes", df.dtypes)
    demo("df.head(3)", df.head(3))
    demo("df.describe()", df.describe().round(2))

    buffer: list[str] = []
    df.info(buf=type("W", (), {"write": lambda _self, text: buffer.append(text)})())
    demo("df.info()", "".join(buffer).strip())

    section("columns in and out")
    demo("df['math']  -> Series", df["math"].head(3))
    demo("df[['math', 'science']]  -> DataFrame", df[["math", "science"]].head(3))
    note("One set of brackets gives a Series; two gives a DataFrame with one column.")


def section_selection() -> None:
    """.loc selects by label, .iloc by position. Use them; plain [] is ambiguous
    and, under Copy-on-Write, assigning through it silently does nothing."""
    df = toy_frame().set_index("student")
    section("indexed by student name")
    demo("df", df)

    section(".loc -- labels, and the end label IS included")
    demo("df.loc['Chen']", df.loc["Chen"])
    demo("df.loc['Bilal':'Divya', 'math':'science']", df.loc["Bilal":"Divya", "math":"science"])
    demo("df.loc[:, 'grade']", df.loc[:, "grade"])

    section(".iloc -- positions, end excluded")
    demo("df.iloc[0]", df.iloc[0])
    demo("df.iloc[1:3, 1:3]", df.iloc[1:3, 1:3])
    demo("df.iloc[[0, -1]]", df.iloc[[0, -1]])

    section("boolean filtering")
    demo("df[df['math'] > 70]", df[df["math"] > 70])
    demo("two conditions need & and parentheses", df[(df["math"] > 60) & (df["grade"] == 9)])
    demo("isin", df[df["city"].isin(["Pune", "Chennai"])])
    demo("between", df[df["study_minutes"].between(100, 300)])
    demo("query() reads better for long filters", df.query("math > 60 and city == 'Pune'"))

    section("assignment goes through .loc")
    flagged = df.copy()
    flagged.loc[flagged["study_minutes"] < 100, "needs_followup"] = True
    flagged["needs_followup"] = flagged["needs_followup"].fillna(False)
    demo("flagged", flagged)


def section_columns_and_transforms() -> None:
    """Deriving columns: vectorized expressions first, .map/.apply only when
    there is no vectorized equivalent."""
    df = toy_frame()
    section("vectorized expressions")
    df["total"] = df["math"] + df["science"]
    df["average"] = df[["math", "science"]].mean(axis=1).round(1)
    df["study_hours"] = (df["study_minutes"] / 60).round(2)
    demo("df", df)

    section("assign() keeps a chain unbroken and never mutates the input")
    chained = (
        toy_frame()
        .assign(
            total=lambda d: d["math"] + d["science"],
            passed=lambda d: d["math"].ge(50) & d["science"].ge(50),
        )
        .sort_values("total", ascending=False)
    )
    demo("chained", chained)

    section("conditional columns")
    demo(
        "np.where for two outcomes",
        pd.Series(np.where(df["average"] >= 75, "high", "low"), index=df.index).head(),
    )
    bands = pd.cut(
        df["average"],
        bins=[0, 50, 70, 85, 100],
        labels=["needs work", "fair", "good", "excellent"],
    )
    demo("pd.cut for fixed numeric bands", pd.DataFrame({"average": df["average"], "band": bands}))
    demo("pd.qcut for equal-sized buckets", pd.qcut(df["study_minutes"], q=3, labels=["low", "mid", "high"]))

    section("map / apply / replace")
    demo("Series.map with a dict", df["city"].map({"Pune": "West", "Delhi": "North", "Chennai": "South"}))
    demo("Series.map with a function", df["student"].map(len))
    demo("row-wise apply (slow -- last resort)", df.apply(lambda r: f"{r['student']}:{r['total']}", axis=1))
    demo("string accessor", df["student"].str.upper().str.slice(0, 3))

    section("sorting and ranking")
    demo("sort_values on two keys", df.sort_values(["grade", "total"], ascending=[True, False])[["student", "grade", "total"]])
    demo("rank within the whole frame", df["total"].rank(ascending=False).astype(int).tolist())
    demo("nlargest", df.nlargest(3, "total")[["student", "total"]])


def section_groupby() -> None:
    """split -> apply -> combine. The grouping keys become the result index."""
    df = toy_frame()
    section("one key, one aggregation")
    demo("df.groupby('city')['math'].mean()", df.groupby("city")["math"].mean().round(2))
    demo("group sizes", df.groupby("city").size())
    demo("as_index=False keeps it a flat frame", df.groupby("city", as_index=False)["math"].mean())

    section("many aggregations with named output columns")
    summary = df.groupby("city").agg(
        students=("student", "count"),
        avg_math=("math", "mean"),
        best_science=("science", "max"),
        total_minutes=("study_minutes", "sum"),
    ).round(2)
    demo("summary", summary)

    section("several keys -> a MultiIndex")
    multi = df.groupby(["city", "grade"])["math"].mean()
    demo("multi", multi)
    demo("unstack the last level into columns", multi.unstack())
    demo("back to columns with reset_index", multi.reset_index())

    section("transform keeps the original row count")
    df["city_avg_math"] = df.groupby("city")["math"].transform("mean")
    df["vs_city"] = (df["math"] - df["city_avg_math"]).round(2)
    demo("each row compared against its own group", df[["student", "city", "math", "city_avg_math", "vs_city"]])

    section("filter drops whole groups")
    demo("only cities averaging above 65 in math", df.groupby("city").filter(lambda g: g["math"].mean() > 65))

    section("value_counts is a groupby shortcut for categories")
    demo("counts", df["city"].value_counts())
    demo("proportions", df["city"].value_counts(normalize=True).round(3))
    demo("cross-tab of two categoricals", pd.crosstab(df["city"], df["grade"]))


def section_combining_frames() -> None:
    """concat stacks; merge joins on keys. Check row counts after every join."""
    scores = toy_frame()[["student", "city", "math"]]
    attendance = pd.DataFrame(
        {
            "student": ["Asha", "Bilal", "Chen", "Divya", "Gita"],
            "attendance_pct": [94.0, 71.5, 88.0, 90.5, 99.0],
        }
    )
    section("the two inputs")
    demo("scores", scores)
    demo("attendance", attendance)

    section("merge -- how= decides which keys survive")
    demo("inner (default): keys present in both", scores.merge(attendance, on="student"))
    demo("left: every score row kept", scores.merge(attendance, on="student", how="left"))
    demo("outer: everything, gaps as NaN", scores.merge(attendance, on="student", how="outer"))
    demo(
        "indicator=True shows where each row came from",
        scores.merge(attendance, on="student", how="outer", indicator=True)[["student", "_merge"]],
    )
    note("A merge that silently multiplies rows means duplicate keys. Pass "
         "validate='one_to_one' (or 'one_to_many') and let pandas raise instead.")

    section("concat -- stack rows or glue columns")
    demo("rows", pd.concat([scores.head(2), scores.tail(2)], ignore_index=True))
    demo("columns", pd.concat([scores.set_index("student"), attendance.set_index("student")], axis=1))

    section("join on the index")
    demo("DataFrame.join", scores.set_index("student").join(attendance.set_index("student"), how="left"))


def section_reshaping_and_time() -> None:
    """pivot_table for wide summaries, melt to go back to long, and the .dt
    accessor for anything with dates."""
    df = toy_frame()
    section("pivot_table: rows x columns x aggregated value")
    demo(
        "mean math by city and grade",
        pd.pivot_table(df, values="math", index="city", columns="grade", aggfunc="mean"),
    )
    demo(
        "two values, with margins",
        pd.pivot_table(df, values=["math", "science"], index="city", aggfunc="mean", margins=True).round(1),
    )

    section("melt: wide -> long, one row per observation")
    long = df.melt(
        id_vars=["student", "city"],
        value_vars=["math", "science"],
        var_name="subject",
        value_name="score",
    )
    demo("long", long.head(6))
    demo("and back again", long.pivot(index="student", columns="subject", values="score"))

    section("datetimes")
    dates = pd.Series(pd.to_datetime(["2025-04-05", "2025-07-19", "2026-01-30"]))
    demo("the .dt accessor", pd.DataFrame({
        "date": dates,
        "year": dates.dt.year,
        "month_name": dates.dt.month_name(),
        "weekday": dates.dt.day_name(),
        "quarter": dates.dt.quarter,
    }))
    demo("arithmetic yields Timedelta", (dates.max() - dates.min()))
    timeline = pd.Series([3, 5, 2, 8, 6], index=pd.date_range("2025-09-01", periods=5, freq="D"))
    demo("resample a time index", timeline.resample("2D").sum())
    demo("rolling window", timeline.rolling(3).mean().round(2))


def section_reading_real_data() -> None:
    """Read the messy CSV the way you would in practice: look before you leap."""
    if not RAW_CSV.exists():
        note("data/students_raw.csv missing -- run 00_make_dataset.py first.")
        return

    df = pd.read_csv(RAW_CSV)
    section("what read_csv inferred")
    demo("shape", df.shape)
    demo("dtypes", df.dtypes)
    note(
        "study_minutes and attendance_pct came back as a text dtype rather than float, "
        "because a handful of values are strings like '1,200 min' and '93.2%'. "
        "Script 03 fixes this."
    )

    section("first look")
    demo("head(3)", df.head(3))
    demo("missing per column", df.isna().sum())
    demo("duplicate rows", df.duplicated().sum())
    demo("city values as stored", sorted(df["city"].dropna().unique().tolist()))

    section("read_csv options that prevent most of the pain")
    typed = pd.read_csv(
        RAW_CSV,
        na_values=["N/A", "null", "-", "", "   "],
        dtype={"student_id": "string", "school": "category"},
    )
    demo("na_values turns sentinels into real NaN", typed.isna().sum().loc[["city", "device", "science_score"]])
    demo("dtype= sets types at load time", typed.dtypes.loc[["student_id", "school"]])
    demo("memory saved by category", {
        "object": int(df["school"].memory_usage(deep=True)),
        "category": int(typed["school"].memory_usage(deep=True)),
    })


SECTIONS = [
    section_series,
    section_dataframe_basics,
    section_selection,
    section_columns_and_transforms,
    section_groupby,
    section_combining_frames,
    section_reshaping_and_time,
    section_reading_real_data,
]

if __name__ == "__main__":
    run(SECTIONS)
