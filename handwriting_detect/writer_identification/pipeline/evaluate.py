#!/usr/bin/env python3
"""Case 1 accuracy, measured so that different metrics and pool sizes compare.

Replaces the single number signature_test.py reports. Two problems with
quoting top-1 alone, both of which bite us right now:

  - It is not comparable across candidate-pool sizes. 40.8% against 11
    students and 25% against 181 are not a regression; random is 9.1% in the
    first case and 0.55% in the second. Lift over random is the comparable
    figure.
  - It is all-or-nothing. A system that ranks the true writer 2nd out of 181
    every time is enormously useful and scores 0% top-1. Rank-aware numbers
    show that; top-1 hides it.

So every run reports top-1, top-5, MRR and lift together.

MRR, not mAP: each query has exactly one correct writer, and average precision
with a single relevant item reduces to 1/rank. Calling that mAP would overstate
what it measures.

Protocol (leave-one-out, per case1_identification.md):
  hold out one worksheet -> rebuild its owner's signature from their *other*
  worksheets only -> rank every enrolled student's signature by distance to the
  held-out worksheet -> record where the true owner landed.

The held-out worksheet never contributes to the signature it is judged
against. Students with a single worksheet cannot be queried (no signature
remains once it is held out) but stay in the candidate pool as distractors,
which is what production looks like.

Closed-set: the true writer is always among the candidates. Real use is
open-set and scores lower -- see case1_identification.md.

Uses cached fingerprints only, no network.

Usage:
    python3 evaluate.py                      # compare all metrics
    python3 evaluate.py --metric chi2        # just one
    python3 evaluate.py --scalar-weights 0 0.25 0.5
"""

import argparse
import json
from collections import defaultdict
from pathlib import Path

import numpy as np

import gate
import main
import metrics

OUTPUT_DIR = Path(__file__).resolve().parent / "output"


def load_worksheets():
    """Pages -> one mean vector per worksheet, with the scalar block z-scored
    across the corpus and the Hinge block left as raw probabilities.

    The split treatment is the whole point: the scalars are unrelated
    measurements in different units and need a common scale, while the
    histogram is a distribution whose bins are already commensurable and whose
    shape z-scoring destroys (see metrics.py).
    """
    items, total, skipped = main.load_items()
    print(f"Loaded {len(items)}/{total} pages ({skipped} skipped) from cache")

    by_worksheet = defaultdict(list)
    for item in items:
        by_worksheet[item["worksheet_id"]].append(item)

    worksheets = []
    for worksheet_id, group in by_worksheet.items():
        stacked = np.vstack([g["raw_vector"] for g in group])
        worksheets.append(
            {
                "worksheet_id": worksheet_id,
                "user_id": group[0]["user_id"],
                "content_key": group[0]["content_key"],
                "raw_vector": np.nanmean(stacked, axis=0),
                "n_pages": len(group),
            }
        )

    stacked = np.vstack([w["raw_vector"] for w in worksheets])
    scalars = stacked[:, : metrics.N_SCALARS]
    mean = np.nanmean(scalars, axis=0)
    std = np.nanstd(scalars, axis=0)
    std_safe = np.where(std > 1e-9, std, 1.0)
    scalars_z = np.where(std[None, :] > 1e-9, (scalars - mean) / std_safe, 0.0)

    for i, w in enumerate(worksheets):
        w["vector"] = np.concatenate([scalars_z[i], stacked[i, metrics.N_SCALARS:]])

    return worksheets


def evaluate_transform_honest(worksheets, make_transform):
    """Leave-one-out ranking with the transform REFIT for every query, on all
    worksheets except the held-out one.

    Why this is not optional. PCA-whitening is fit on the corpus, and our
    corpus is 142 worksheets in 149 dimensions -- roughly as many samples as
    dimensions. In that regime the trailing principal components are noise
    directions with near-zero variance, and whitening divides by that variance,
    so it amplifies them enormously. If the held-out worksheet took part in the
    fit, those amplified directions are partly built out of the very vector
    being scored, and the query looks far more separable than it is.

    Fitting without the query removes that path. The gap between the two
    numbers is the size of the leak, which is itself worth reporting.
    """
    by_student = defaultdict(list)
    for w in worksheets:
        by_student[w["user_id"]].append(w)
    students = sorted(by_student)

    ranks = []
    for held_out in worksheets:
        owner = held_out["user_id"]
        own_others = [w for w in by_student[owner] if w["worksheet_id"] != held_out["worksheet_id"]]
        if not own_others:
            continue

        others = [w for w in worksheets if w["worksheet_id"] != held_out["worksheet_id"]]
        transform = make_transform().fit([w["vector"] for w in others])
        query = transform.transform(held_out["vector"])

        scored = []
        for student in students:
            group = own_others if student == owner else by_student[student]
            group = [w for w in group if w["worksheet_id"] != held_out["worksheet_id"]]
            if not group:
                continue
            signature = np.mean(
                np.vstack([transform.transform(w["vector"]) for w in group]), axis=0
            )
            scored.append((metrics.euclidean_distance(query, signature), student))

        scored.sort(key=lambda pair: pair[0])
        rank = next((i for i, (_, s) in enumerate(scored, 1) if s == owner), None)
        if rank is not None:
            ranks.append(rank)

    return _summarize_ranks(ranks, len(students))


def _summarize_ranks(ranks, n_students):
    if not ranks:
        return None
    ranks = np.array(ranks)
    top1 = float((ranks == 1).mean())
    return {
        "queries": len(ranks),
        "candidates": n_students,
        "top1": top1,
        "top5": float((ranks <= 5).mean()),
        "mrr": float((1.0 / ranks).mean()),
        "median_rank": int(np.median(ranks)),
        "random_top1": 1.0 / n_students,
        "lift": top1 * n_students,
    }


def evaluate_metric(worksheets, distance_fn):
    """Leave-one-out ranking over every worksheet. Returns a summary dict."""
    by_student = defaultdict(list)
    for w in worksheets:
        by_student[w["user_id"]].append(w)
    students = sorted(by_student)

    # Signatures over a student's full history, computed once. For the query's
    # own owner this is rebuilt per query without the held-out worksheet.
    full_signature = {
        student: np.nanmean(np.vstack([w["vector"] for w in group]), axis=0)
        for student, group in by_student.items()
    }

    ranks = []
    for held_out in worksheets:
        owner = held_out["user_id"]
        own_others = [w for w in by_student[owner] if w["worksheet_id"] != held_out["worksheet_id"]]
        if not own_others:
            continue  # cannot build a signature without this worksheet

        scored = []
        for student in students:
            if student == owner:
                signature = np.nanmean(np.vstack([w["vector"] for w in own_others]), axis=0)
            else:
                signature = full_signature[student]
            scored.append((distance_fn(held_out["vector"], signature), student))

        scored.sort(key=lambda pair: pair[0])
        rank = next(i for i, (_, student) in enumerate(scored, 1) if student == owner)
        ranks.append(rank)

    return _summarize_ranks(ranks, len(students))


def auc(a, b):
    a, b = np.asarray(a), np.asarray(b)
    if not len(a) or not len(b):
        return float("nan")
    wins = (a[:, None] < b[None, :]).sum() + 0.5 * (a[:, None] == b[None, :]).sum()
    return float(wins / (len(a) * len(b)))


def bucket_aucs(worksheets, distance_fn):
    """The gate's confound checks, under this metric."""
    buckets = gate.build_buckets(worksheets, distance_fn=distance_fn)
    same_day = buckets["same_student_diff_day"]
    same_content = buckets["diff_student_same_content"]
    general = buckets["diff_student_general"]
    return {
        "auc_signal": auc(same_day, general),
        "auc_vs_content_confound": auc(same_day, same_content),
        "auc_confound_size": auc(same_content, general),
        "n_same_day": len(same_day),
        "n_same_content": len(same_content),
        "n_general": len(general),
    }


def baseline_metric(worksheets):
    """The original metric, reproduced exactly: z-score all 149 dimensions
    together, then Euclidean. Kept as the comparison point everything else has
    to beat.
    """
    raw = [w["raw_vector"] for w in worksheets]
    standardized = gate.standardize(raw)
    lookup = {id(w): vec for w, vec in zip(worksheets, standardized)}
    return lookup


def main_cli():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--metric", default=None, help="only this histogram metric")
    parser.add_argument(
        "--scalar-weights", type=float, nargs="+", default=[0.0, 0.25],
        help="weights to try for the scalar block alongside the histogram",
    )
    parser.add_argument(
        "--honest", action="store_true",
        help="refit each corpus-fitted transform per query, excluding the held-out "
             "worksheet; slower, and the only number safe to quote",
    )
    parser.add_argument(
        "--skip-pairwise", action="store_true",
        help="only evaluate the corpus-fitted transforms, not the pairwise metrics",
    )
    args = parser.parse_args()

    worksheets = load_worksheets()
    students = {w["user_id"] for w in worksheets}
    print(f"{len(worksheets)} worksheets across {len(students)} students\n")

    results = []

    # --- baseline: the metric currently in gate.py -----------------------
    baseline_vectors = baseline_metric(worksheets)
    baseline_worksheets = [dict(w, vector=baseline_vectors[id(w)]) for w in worksheets]
    row = evaluate_metric(baseline_worksheets, gate.distance)
    if row:
        row["metric"] = "BASELINE z-scored-all + euclidean"
        row.update(bucket_aucs(baseline_worksheets, gate.distance))
        results.append(row)

    # --- candidates ------------------------------------------------------
    names = [] if args.skip_pairwise else ([args.metric] if args.metric else list(metrics.HISTOGRAM_METRICS))
    all_vectors = [w["vector"] for w in worksheets]
    for name in names:
        for weight in args.scalar_weights:
            fused = metrics.FusedMetric(name, weight).calibrate(all_vectors)
            row = evaluate_metric(worksheets, fused)
            if row:
                row["metric"] = fused.name
                row.update(bucket_aucs(worksheets, fused))
                results.append(row)

    # --- corpus-fitted transforms ----------------------------------------
    # Fitted on all worksheets, which leaks a little: the transform sees the
    # held-out worksheet's vector. It is an unsupervised fit with no writer
    # labels, so the leak is small, but it does mean these numbers are a mild
    # upper bound and the winner should be re-checked with the transform fit
    # on training worksheets only before anything ships.
    for name, make in metrics.TRANSFORMS.items():
        transform = make().fit(all_vectors)
        transformed = [
            dict(w, vector=transform.transform(w["vector"])) for w in worksheets
        ]
        row = evaluate_metric(transformed, metrics.euclidean_distance)
        if row:
            row["metric"] = f"T:{name}"
            row.update(bucket_aucs(transformed, metrics.euclidean_distance))
            if args.honest:
                honest = evaluate_transform_honest(worksheets, make)
                row["top1_leaky"] = row["top1"]
                row["top1"] = honest["top1"]
                row["top5"] = honest["top5"]
                row["mrr"] = honest["mrr"]
                row["median_rank"] = honest["median_rank"]
                row["lift"] = honest["lift"]
                row["leak"] = row["top1_leaky"] - honest["top1"]
            results.append(row)

    results.sort(key=lambda r: -r["top1"])

    header = f"{'metric':38} {'top1':>7} {'top5':>7} {'MRR':>6} {'lift':>7} {'AUCsig':>7} {'AUCcon':>7}"
    print(header)
    print("-" * len(header))
    for r in results:
        print(
            f"{r['metric']:38} {r['top1']:>6.1%} {r['top5']:>6.1%} {r['mrr']:>6.3f} "
            f"{r['lift']:>6.1f}x {r['auc_signal']:>7.3f} {r['auc_vs_content_confound']:>7.3f}"
            + (f"  (leaky {r['top1_leaky']:.1%}, leak {r['leak']:+.1%})" if "leak" in r else "")
        )

    best = results[0]
    print(
        f"\nBest: {best['metric']}  --  top-1 {best['top1']:.1%} over "
        f"{best['candidates']} candidates (random {best['random_top1']:.2%}, "
        f"lift {best['lift']:.1f}x), median rank {best['median_rank']}"
    )
    print("AUCsig = same-student-different-day vs different-students (higher is better).")
    print("AUCcon = same-student-different-day vs different-students-same-worksheet")
    print("         (the content confound; must also stay well above 0.5).")

    OUTPUT_DIR.mkdir(exist_ok=True)
    out = OUTPUT_DIR / "metric_comparison.json"
    with out.open("w") as f:
        json.dump({"worksheets": len(worksheets), "students": len(students), "results": results}, f, indent=2)
    print(f"\nWritten to {out}")


if __name__ == "__main__":
    main_cli()
