"""k-means clustering on data/students_clean.csv.

Run:  .venv/bin/python 11_kmeans_clustering.py   (run 03_data_cleaning.py first)

k-means groups rows into k clusters by repeating two steps until they stop
changing: assign each point to its nearest centroid, then move each centroid
to the mean of the points assigned to it. It needs k chosen up front, it only
finds round (roughly equal-variance) clusters, and -- like every distance-based
method -- it is at the mercy of whatever scale the features happen to be on.
"""

from __future__ import annotations

from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler

from lesson_utils import demo, note, run, section

CLEAN_CSV = Path(__file__).parent / "data" / "students_clean.csv"
OUTPUT_DIR = Path(__file__).parent / "outputs"
FEATURES = ["study_minutes", "attendance_pct", "average_score"]


def load() -> pd.DataFrame:
    return pd.read_csv(CLEAN_CSV)


def section_scale_matters() -> None:
    """Unscaled features let the one with the biggest numbers dominate 'distance'."""
    df = load()
    section("why features get standardized first")
    demo("raw feature ranges", df[FEATURES].agg(["min", "max"]).T)
    note("study_minutes ranges over hundreds of units, attendance_pct and "
         "average_score over roughly 0-100. Euclidean distance -- which k-means "
         "uses to decide 'nearest centroid' -- would be almost entirely driven by "
         "study_minutes if left unscaled, making the other two features nearly "
         "irrelevant to the clustering.")
    scaled = StandardScaler().fit_transform(df[FEATURES])
    demo("scaled feature std (all should be ~1.0)", np.std(scaled, axis=0).round(2))


def section_choosing_k_with_the_elbow_method() -> None:
    """Inertia always drops as k grows; look for where it stops dropping fast."""
    df = load()
    scaled = StandardScaler().fit_transform(df[FEATURES])

    section("inertia (within-cluster sum of squares) vs. k")
    ks = range(1, 9)
    inertias = []
    silhouettes = []
    for k in ks:
        model = KMeans(n_clusters=k, random_state=0, n_init=10).fit(scaled)
        inertias.append(model.inertia_)
        silhouettes.append(silhouette_score(scaled, model.labels_) if k > 1 else float("nan"))
    demo("inertia by k", {k: round(v, 1) for k, v in zip(ks, inertias)})
    demo("silhouette score by k (higher = better separated, -1 to 1)",
         {k: round(v, 3) for k, v in zip(ks, silhouettes) if k > 1})
    note("Inertia always decreases as k grows -- k equal to the number of rows gives "
         "zero inertia and zero usefulness. The 'elbow' is the k where adding another "
         "cluster stops buying much of a drop. Silhouette score is the sharper tool: "
         "it does not just fall monotonically, so its peak is a real signal for k.")

    OUTPUT_DIR.mkdir(exist_ok=True)
    fig, (ax_elbow, ax_sil) = plt.subplots(1, 2, figsize=(11, 4.2))
    ax_elbow.plot(list(ks), inertias, marker="o")
    ax_elbow.set(xlabel="k", ylabel="inertia", title="elbow plot")
    ax_sil.plot(list(ks)[1:], silhouettes[1:], marker="o", color="darkorange")
    ax_sil.set(xlabel="k", ylabel="silhouette score", title="silhouette by k")
    fig.tight_layout()
    fig.savefig(OUTPUT_DIR / "19_kmeans_choosing_k.png", dpi=110)
    plt.close(fig)
    demo("saved", "outputs/19_kmeans_choosing_k.png")


def section_fitting_and_profiling_clusters() -> None:
    """Fit k=3, then describe each cluster in the original, human-readable units."""
    df = load()
    scaled = StandardScaler().fit_transform(df[FEATURES])
    model = KMeans(n_clusters=3, random_state=0, n_init=10).fit(scaled)
    df = df.assign(cluster=model.labels_)

    section("k=3 clusters, described in original units")
    profile = df.groupby("cluster")[FEATURES].agg(["count", "mean"]).round(1)
    demo("cluster profile", profile)
    note("Centroids live in scaled space, where distances were computed, but the "
         "profile is reported back in original units -- that's the table a human "
         "reads to name the clusters ('high effort', 'struggling', etc.), not the "
         "raw centroid coordinates.")

    section("how clusters relate to the study_band labels made in 03_data_cleaning.py")
    cross_tab = pd.crosstab(df["cluster"], df["study_band"])
    demo("cluster x study_band", cross_tab)
    note("study_band was built from a fixed rule on study_minutes alone "
         "(03_data_cleaning.py); the clusters were found from three features "
         "jointly with no rule at all. Where they agree, both views are telling "
         "the same story; where they disagree, the cluster is drawing on "
         "attendance or score information the band never had.")


def section_limitations() -> None:
    """What k-means assumes, and why that can be the wrong assumption."""
    section("what k-means assumes, and when that bites")
    for line in [
        "clusters are roughly spherical and similar in size -- an elongated or "
        "crescent-shaped true group gets cut into pieces or merged incorrectly",
        "k must be chosen in advance -- the algorithm cannot propose '2 is "
        "obviously wrong, try 5' on its own",
        "every feature is given equal weight after scaling -- an irrelevant "
        "feature can still distort the clusters because k-means has no concept "
        "of feature relevance",
        "results depend on the random initial centroids -- n_init=10 (the default) "
        "runs the whole algorithm 10 times and keeps the best, to reduce the "
        "chance of landing in a bad local optimum",
    ]:
        note(f"- {line}")


SECTIONS = [
    section_scale_matters,
    section_choosing_k_with_the_elbow_method,
    section_fitting_and_profiling_clusters,
    section_limitations,
]

if __name__ == "__main__":
    run(SECTIONS)
