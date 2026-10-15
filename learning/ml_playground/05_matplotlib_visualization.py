"""Matplotlib: the object API, the chart types, and how to make them readable.

Run:  .venv/bin/python 05_matplotlib_visualization.py   (run 03 first)

Writes PNGs to outputs/. There are two matplotlib APIs: the implicit pyplot one
(plt.plot, plt.title -- acts on whichever Axes is "current") and the explicit
object one (fig, ax = plt.subplots; ax.plot; ax.set_title). Everything here uses
the explicit one. It is the only one that stays sane once a figure has more than
one panel, and it is what pandas' .plot(ax=...) expects.
"""

from __future__ import annotations

from pathlib import Path

import matplotlib

matplotlib.use("Agg")  # headless backend: render to file, never open a window

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from matplotlib.ticker import FuncFormatter, PercentFormatter

from lesson_utils import demo, note, run, section

BASE = Path(__file__).parent
CLEAN_CSV = BASE / "data" / "students_clean.csv"
OUTPUT_DIR = BASE / "outputs"

INK = "#1f2933"
MUTED = "#7b8794"
GRID = "#e4e7eb"
ACCENT = "#2f6fdb"
PALETTE = ["#2f6fdb", "#e8833a", "#2fa36b", "#c2456b", "#7a5bd6"]
BAND_ORDER = ["<1h", "1-3h", "3-6h", "6h+"]
SCORE_COLUMNS = ["math_score", "science_score", "english_score"]

plt.rcParams.update({
    "figure.dpi": 110,
    "savefig.dpi": 150,
    "savefig.bbox": "tight",
    "font.size": 10,
    "axes.titlesize": 12,
    "axes.titleweight": "bold",
    "axes.labelcolor": MUTED,
    "axes.edgecolor": GRID,
    "axes.titlecolor": INK,
    "text.color": INK,
    "xtick.color": MUTED,
    "ytick.color": MUTED,
    "axes.grid": True,
    "grid.color": GRID,
    "grid.linewidth": 0.8,
    "axes.axisbelow": True,
    "figure.facecolor": "white",
    "axes.spines.top": False,
    "axes.spines.right": False,
})


def load() -> pd.DataFrame:
    df = pd.read_csv(CLEAN_CSV, parse_dates=["enrolled_on"])
    df["study_band"] = pd.Categorical(df["study_band"], categories=BAND_ORDER, ordered=True)
    return df


def save(fig: plt.Figure, name: str) -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)
    path = OUTPUT_DIR / name
    fig.savefig(path)
    plt.close(fig)  # free the figure; matplotlib keeps every open one in memory
    demo("wrote", f"outputs/{name}")


def section_figure_anatomy() -> None:
    """A Figure is the canvas; an Axes is one plot on it with its own x and y.
    Nearly every call you will make is a method on an Axes."""
    section("the pieces")
    note("Figure -> Axes -> (lines, bars, patches) + xaxis/yaxis + spines + legend. "
         "fig.suptitle() titles the canvas; ax.set_title() titles one panel.")

    fig, ax = plt.subplots(figsize=(8, 4.5))
    x = np.linspace(0, 10, 200)
    ax.plot(x, np.sin(x), color=ACCENT, linewidth=2, label="sin(x)")
    ax.plot(x, np.cos(x), color=PALETTE[1], linewidth=2, linestyle="--", label="cos(x)")
    ax.set_title("Anatomy of a matplotlib figure")
    ax.set_xlabel("x  <- ax.set_xlabel()")
    ax.set_ylabel("y  <- ax.set_ylabel()")
    ax.set_ylim(-1.6, 1.9)
    ax.legend(loc="upper right", frameon=False)
    ax.annotate(
        "ax.annotate() points at a data coordinate",
        xy=(np.pi / 2, 1.0),
        xytext=(3.4, 1.6),
        arrowprops={"arrowstyle": "->", "color": MUTED},
        color=MUTED,
    )
    ax.axhline(0, color=MUTED, linewidth=1)
    ax.text(0.2, -1.45, "ax.text() places text in data space", color=MUTED, fontsize=9)
    fig.suptitle("fig.suptitle() sits above everything", color=MUTED, fontsize=10, y=1.02)
    save(fig, "01_anatomy.png")

    section("subplot grids")
    fig, axes = plt.subplots(2, 2, figsize=(9, 6), sharex=True, sharey=True)
    rng = np.random.default_rng(7)
    for index, ax in enumerate(axes.flat):
        ax.plot(x, np.sin(x + index) * rng.uniform(0.6, 1.2), color=PALETTE[index])
        ax.set_title(f"axes.flat[{index}]", fontsize=10)
    fig.suptitle("plt.subplots(2, 2, sharex=True, sharey=True)")
    fig.tight_layout()
    save(fig, "02_subplot_grid.png")
    note("sharex/sharey force one scale across panels, which is what makes a grid "
         "comparable. tight_layout() stops labels overlapping.")


def section_distributions() -> None:
    """One variable: histogram for shape, box or violin for comparison across
    groups. Pick bins deliberately -- they decide what the reader sees."""
    df = load()
    section("histogram, and what bin count does to it")
    fig, axes = plt.subplots(1, 3, figsize=(12, 3.6), sharey=False)
    for ax, bins in zip(axes, [5, 20, 80]):
        ax.hist(df["study_minutes"], bins=bins, color=ACCENT, edgecolor="white")
        ax.set_title(f"bins={bins}")
        ax.set_xlabel("study minutes")
    axes[0].set_ylabel("students")
    fig.suptitle("The same data, three bin counts")
    fig.tight_layout()
    save(fig, "03_histogram_bins.png")
    note("Too few bins hides the shape; too many turns it into noise. Start with "
         "'auto' and adjust: ax.hist(x, bins='auto').")

    section("histogram with the summary statistics marked")
    fig, ax = plt.subplots(figsize=(8, 4.5))
    ax.hist(df["study_minutes"], bins="auto", color=ACCENT, alpha=0.85, edgecolor="white")
    for value, label, color in [
        (df["study_minutes"].median(), "median", PALETTE[2]),
        (df["study_minutes"].mean(), "mean", PALETTE[1]),
    ]:
        ax.axvline(value, color=color, linewidth=2, linestyle="--",
                   label=f"{label} = {value:,.0f} min")
    ax.set_title("Study time is right-skewed, so mean > median")
    ax.set_xlabel("study minutes")
    ax.set_ylabel("students")
    ax.legend(frameon=False)
    save(fig, "04_histogram_annotated.png")

    section("box plot: five numbers per group, side by side")
    groups = [df.loc[df["study_band"] == band, "average_score"].dropna() for band in BAND_ORDER]
    fig, (left, right) = plt.subplots(1, 2, figsize=(11, 4.5))
    box = left.boxplot(groups, tick_labels=BAND_ORDER, patch_artist=True, widths=0.6)
    for patch, color in zip(box["boxes"], PALETTE):
        patch.set_facecolor(color)
        patch.set_alpha(0.65)
    for median in box["medians"]:
        median.set_color(INK)
    left.set_title("Box: median, quartiles, whiskers, outliers")
    left.set_xlabel("study band")
    left.set_ylabel("average score")

    violin = right.violinplot(groups, showmedians=True)
    for body, color in zip(violin["bodies"], PALETTE):
        body.set_facecolor(color)
        body.set_alpha(0.55)
    right.set_xticks(range(1, len(BAND_ORDER) + 1), BAND_ORDER)
    right.set_title("Violin: the full shape, not just the quartiles")
    right.set_xlabel("study band")
    fig.tight_layout()
    save(fig, "05_box_violin.png")
    note("A box plot hides bimodality -- two clusters and one wide spread draw the "
         "same box. Use a violin, or overlay the points, when n is small enough.")


def section_comparisons() -> None:
    """Categories: bars. Sort them, label them, and start the axis at zero."""
    df = load()
    by_school = df.groupby("school")["average_score"].mean().sort_values()

    section("horizontal bars for long category names")
    fig, ax = plt.subplots(figsize=(8, 4.2))
    bars = ax.barh(by_school.index, by_school.to_numpy(), color=ACCENT, height=0.65)
    bars[-1].set_color(PALETTE[1])
    ax.bar_label(bars, fmt="%.1f", padding=4, color=MUTED, fontsize=9)
    ax.set_title("Average score by school")
    ax.set_xlabel("average score")
    ax.set_xlim(0, 100)
    ax.xaxis.grid(True)
    ax.yaxis.grid(False)
    save(fig, "06_bar_ranked.png")
    note("Sort by value unless the category has its own order. Highlight one bar "
         "instead of colouring all five differently -- colour should mean something.")

    section("grouped vs stacked bars")
    table = pd.crosstab(df["study_band"], df["performance"]).reindex(BAND_ORDER)
    positions = np.arange(len(table.index))
    width = 0.8 / len(table.columns)

    fig, (grouped, stacked) = plt.subplots(1, 2, figsize=(12, 4.5))
    for index, column in enumerate(table.columns):
        grouped.bar(positions + index * width, table[column], width,
                    label=column, color=PALETTE[index])
    grouped.set_xticks(positions + width * (len(table.columns) - 1) / 2, table.index)
    grouped.set_title("Grouped: compare within a band")
    grouped.set_ylabel("students")
    grouped.legend(frameon=False, fontsize=8)

    bottom = np.zeros(len(table.index))
    shares = table.div(table.sum(axis=1), axis=0).mul(100)
    for index, column in enumerate(shares.columns):
        stacked.bar(table.index, shares[column], bottom=bottom, label=column, color=PALETTE[index])
        bottom += shares[column].to_numpy()
    stacked.set_title("Stacked to 100%: compare composition")
    stacked.yaxis.set_major_formatter(PercentFormatter())
    stacked.legend(frameon=False, fontsize=8, loc="lower right")
    fig.tight_layout()
    save(fig, "07_bars_grouped_stacked.png")
    note("Grouped bars compare values; 100% stacked bars compare shares. A plain "
         "stacked bar does neither well -- only the bottom segment has a flat base.")


def section_relationships() -> None:
    """Two numerics: scatter. Add a fitted line only when a line is defensible."""
    df = load()
    section("scatter, coloured by a third variable")
    fig, ax = plt.subplots(figsize=(8.5, 5))
    for color, band in zip(PALETTE, BAND_ORDER):
        subset = df[df["study_band"] == band]
        ax.scatter(subset["study_minutes"], subset["average_score"],
                   s=26, alpha=0.75, color=color, edgecolor="white", linewidth=0.5, label=band)

    trimmed = df[~df["is_outlier_study"]]
    slope, intercept = np.polyfit(trimmed["study_minutes"], trimmed["average_score"], 1)
    line_x = np.linspace(trimmed["study_minutes"].min(), trimmed["study_minutes"].max(), 50)
    ax.plot(line_x, slope * line_x + intercept, color=INK, linewidth=2,
            label=f"fit (outliers excluded): +{slope * 60:.1f} pts/hour")
    ax.set_title("Study time vs average score")
    ax.set_xlabel("study minutes")
    ax.set_ylabel("average score")
    ax.legend(frameon=False, fontsize=9, loc="lower right")
    save(fig, "08_scatter_fit.png")
    note("The fit excludes the flagged extreme-study rows, and the label says so. "
         "A trend line without that caveat would be a claim the data does not make.")

    section("log scale for a skewed axis")
    fig, (linear, log) = plt.subplots(1, 2, figsize=(11, 4.2), sharey=True)
    for ax, scale in [(linear, "linear"), (log, "log")]:
        ax.scatter(df["study_minutes"].clip(lower=1), df["average_score"],
                   s=20, alpha=0.6, color=ACCENT, edgecolor="none")
        ax.set_xscale(scale)
        ax.set_title(f"x on a {scale} scale")
        ax.set_xlabel("study minutes")
    linear.set_ylabel("average score")
    fig.tight_layout()
    save(fig, "09_log_scale.png")

    section("heatmap of a correlation matrix")
    corr = df[["study_minutes", "attendance_pct", *SCORE_COLUMNS, "average_score"]].corr()
    fig, ax = plt.subplots(figsize=(6.6, 5.4))
    image = ax.imshow(corr, cmap="RdBu_r", vmin=-1, vmax=1)
    labels = [name.replace("_", "\n") for name in corr.columns]
    ax.set_xticks(range(len(labels)), labels, fontsize=8)
    ax.set_yticks(range(len(labels)), labels, fontsize=8)
    for row in range(len(corr)):
        for column in range(len(corr)):
            value = corr.iat[row, column]
            ax.text(column, row, f"{value:.2f}", ha="center", va="center", fontsize=8,
                    color="white" if abs(value) > 0.6 else INK)
    ax.grid(False)
    ax.set_title("Correlation matrix")
    fig.colorbar(image, ax=ax, shrink=0.8, label="Pearson r")
    save(fig, "10_heatmap.png")
    note("vmin=-1, vmax=1 with a diverging colormap keeps zero at the neutral "
         "colour. A sequential map here would make -0.9 and +0.1 look similar.")


def section_time_series() -> None:
    """Dates on the x axis: line charts, a smoothed series, and two scales."""
    df = load()
    monthly = (
        df.set_index("enrolled_on")
        .resample("ME")
        .agg(enrolments=("student_id", "count"), avg_score=("average_score", "mean"))
    )

    section("line plus rolling mean")
    fig, ax = plt.subplots(figsize=(9, 4.5))
    ax.plot(monthly.index, monthly["enrolments"], color=MUTED, linewidth=1,
            marker="o", markersize=4, label="monthly")
    ax.plot(monthly.index, monthly["enrolments"].rolling(3).mean(), color=ACCENT,
            linewidth=2.5, label="3-month rolling mean")
    ax.fill_between(monthly.index, monthly["enrolments"], color=ACCENT, alpha=0.08)
    ax.set_title("Enrolments per month")
    ax.set_ylabel("students")
    ax.set_ylim(bottom=0)
    ax.legend(frameon=False)
    fig.autofmt_xdate()
    save(fig, "11_time_series.png")
    note("Start a count axis at zero. fig.autofmt_xdate() rotates date labels so "
         "they stop colliding.")

    section("two series, two units: twin axes")
    fig, ax = plt.subplots(figsize=(9, 4.5))
    ax.bar(monthly.index, monthly["enrolments"], width=20, color=GRID, label="enrolments")
    ax.set_ylabel("enrolments", color=MUTED)
    twin = ax.twinx()
    twin.plot(monthly.index, monthly["avg_score"], color=PALETTE[1], linewidth=2.5,
              marker="o", markersize=4, label="average score")
    twin.set_ylabel("average score", color=PALETTE[1])
    twin.set_ylim(0, 100)
    twin.grid(False)
    ax.set_title("Enrolments and average score")
    fig.autofmt_xdate()
    save(fig, "12_twin_axis.png")
    note("Twin axes can manufacture a relationship by choice of scale alone. Use "
         "them sparingly, and never to imply that two lines crossing means anything.")


def section_pandas_plotting() -> None:
    """DataFrame.plot is matplotlib underneath. Pass ax= and keep full control."""
    df = load()
    section("df.plot(ax=...) into a layout you control")
    fig, axes = plt.subplots(1, 3, figsize=(13, 4))

    df["average_score"].plot.hist(ax=axes[0], bins=20, color=ACCENT, edgecolor="white",
                                  title="Series.plot.hist")
    df.groupby("city")["average_score"].mean().sort_values().plot.barh(
        ax=axes[1], color=PALETTE[2], title="groupby().plot.barh"
    )
    df.pivot_table(index="grade", columns="gender", values="average_score",
                   aggfunc="mean").plot(ax=axes[2], marker="o", color=PALETTE[:2],
                                        title="pivot_table().plot")
    for ax in axes:
        ax.set_xlabel("")
        ax.set_ylabel("")
    axes[2].legend(frameon=False, fontsize=8)
    fig.tight_layout()
    save(fig, "13_pandas_plot.png")
    note("Everything returned by .plot() is an Axes, so every ax.set_* call from "
         "the rest of this file still applies.")

    section("small multiples: one panel per category, one shared scale")
    cities = sorted(df["city"].unique())
    fig, axes = plt.subplots(1, len(cities), figsize=(3 * len(cities), 3.4),
                             sharey=True, sharex=True)
    for ax, city in zip(np.atleast_1d(axes), cities):
        subset = df[df["city"] == city]
        ax.scatter(subset["study_minutes"], subset["average_score"], s=18,
                   alpha=0.7, color=ACCENT, edgecolor="none")
        ax.set_title(f"{city}  (n={len(subset)})", fontsize=10)
        ax.set_xlabel("study minutes")
    np.atleast_1d(axes)[0].set_ylabel("average score")
    fig.suptitle("Same relationship, one panel per city")
    fig.tight_layout()
    save(fig, "14_small_multiples.png")


def section_dashboard() -> None:
    """A composed figure: GridSpec for uneven panels, one headline, one caption."""
    df = load()
    section("GridSpec layout")
    fig = plt.figure(figsize=(12, 7.5))
    grid = fig.add_gridspec(2, 3, height_ratios=[1, 1], hspace=0.45, wspace=0.3)

    headline = fig.add_subplot(grid[0, :2])
    monthly = df.set_index("enrolled_on").resample("ME")["student_id"].count()
    headline.plot(monthly.index, monthly.to_numpy(), color=ACCENT, linewidth=2.5)
    headline.fill_between(monthly.index, monthly.to_numpy(), color=ACCENT, alpha=0.1)
    headline.set_title("Enrolments per month")
    headline.set_ylim(bottom=0)

    kpi = fig.add_subplot(grid[0, 2])
    kpi.axis("off")
    stats = [
        ("students", f"{len(df):,}"),
        ("median study", f"{df['study_minutes'].median():.0f} min"),
        ("mean score", f"{df['average_score'].mean():.1f}"),
        ("attendance", f"{df['attendance_pct'].mean():.1f}%"),
    ]
    for index, (label, value) in enumerate(stats):
        kpi.text(0.0, 0.85 - index * 0.26, value, fontsize=19, fontweight="bold", color=INK)
        kpi.text(0.0, 0.76 - index * 0.26, " ".join(label.upper()), fontsize=7.5, color=MUTED)

    bands = fig.add_subplot(grid[1, 0])
    medians = df.groupby("study_band", observed=True)["average_score"].median().reindex(BAND_ORDER)
    bars = bands.bar(medians.index, medians.to_numpy(), color=ACCENT, width=0.6)
    bands.bar_label(bars, fmt="%.0f", padding=3, fontsize=8, color=MUTED)
    bands.set_title("Median score by study band", fontsize=11)
    bands.set_ylim(0, 100)

    devices = fig.add_subplot(grid[1, 1])
    counts = df["device"].value_counts()
    devices.barh(counts.index, counts.to_numpy(), color=PALETTE[2], height=0.6)
    devices.set_title("Students by device", fontsize=11)

    spread = fig.add_subplot(grid[1, 2])
    spread.scatter(df["attendance_pct"], df["average_score"], s=14, alpha=0.55,
                   color=PALETTE[4], edgecolor="none")
    spread.set_title("Attendance vs score", fontsize=11)
    spread.set_xlabel("attendance %")

    fig.suptitle("Student engagement overview", fontsize=16, fontweight="bold", x=0.09, ha="left")
    fig.text(0.09, 0.925, f"{len(df):,} students · generated from students_clean.csv",
             fontsize=9, color=MUTED, ha="left")
    fig.text(0.09, 0.02,
             "Imputed values included; extreme-study rows retained. "
             "Association only -- no causal claim.", fontsize=8, color=MUTED, ha="left")
    save(fig, "15_dashboard.png")

    section("formatters and final polish")
    fig, ax = plt.subplots(figsize=(7, 3.6))
    totals = df.groupby("city")["study_minutes"].sum().sort_values()
    ax.barh(totals.index, totals.to_numpy(), color=ACCENT, height=0.6)
    ax.xaxis.set_major_formatter(FuncFormatter(lambda value, _: f"{value / 1000:,.0f}k"))
    ax.set_title("Total study minutes by city")
    save(fig, "16_tick_formatter.png")
    note("FuncFormatter rewrites tick labels without touching the data. Readable "
         "ticks, honest values.")


def section_checklist() -> None:
    """What to check before a chart leaves your editor."""
    for line in [
        "does the title state the finding, not the variable names?",
        "are both axes labelled, with units?",
        "does a bar axis start at zero?",
        "is the category order meaningful -- sorted by value, or by its own scale?",
        "does colour encode something, or is it decoration?",
        "is it readable in greyscale and to a colourblind reader?",
        "is every transformation (log, trim, filter) visible in a label?",
        "is n shown for every group small enough to mislead?",
    ]:
        note(f"- {line}")
    demo("figures written", sorted(p.name for p in OUTPUT_DIR.glob("*.png")))


SECTIONS = [
    section_figure_anatomy,
    section_distributions,
    section_comparisons,
    section_relationships,
    section_time_series,
    section_pandas_plotting,
    section_dashboard,
    section_checklist,
]

if __name__ == "__main__":
    run(SECTIONS)
