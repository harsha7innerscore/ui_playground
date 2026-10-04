#!/usr/bin/env python3
"""Whose handwriting is on this page?

Takes one image (url or local file) and ranks the enrolled students by how
closely it matches their handwriting signature.

    python3 identify.py --list-students
    python3 identify.py <image-url-or-path>
    python3 identify.py <image> --cohort <student_id> <student_id> ...
    python3 identify.py <image> --submitted-by <student_id>
    python3 identify.py <image> --json

What it is, and what it is not
------------------------------
This is a RANKER. It reports who the page looks most like, with a confidence
derived from how far ahead the top match sits. It is not a verdict, and
deliberately emits no OK/MISMATCH classification: in the deployment
configuration 14.7% of genuine submissions rank someone else first, so acting
on a top-1 mismatch alone would wrongly implicate roughly one honest student
in seven.

CLOSED-SET ONLY. Every score is relative to the enrolled candidates. If the
page was written by a parent, sibling, tutor or anyone else not enrolled, this
still returns a ranked list of enrolled students, and the top entry will be
wrong rather than absent. Open-set rejection is not implemented. Treat a
result as "of these candidates, the closest is X", never as "X wrote this".

Accuracy, measured leave-one-out on 105 students / 1283 worksheets:
  - within the real assigned-worksheet cohort (median 16 candidates):
    85.3% top-1, 91.6% top-2, random 11.8%
  - against the full 105-student roster: 69.0% top-1, random 0.95%
Those two are not comparable; the smaller cohort is the easier task.
"""

import argparse
import json
import sys
from collections import defaultdict
from pathlib import Path

import numpy as np

import confound_diagnosis
import evaluate
import features
import metrics
from fetch import fetch_bytes

TRANSFORM = "sqrt+pca"
MIN_INK_PX = 150


def build_index(cache_versions=("features", "features_v2")):
    """Fit the transform and build one signature per enrolled student."""
    evaluate.restrict_to_shared_pages(*cache_versions)
    worksheets = evaluate.load_worksheets()
    meta = confound_diagnosis.load_metadata()

    transform = metrics.TRANSFORMS[TRANSFORM]().fit([w["vector"] for w in worksheets])
    for w in worksheets:
        w["projected"] = transform.transform(w["vector"])
        w["questions"] = meta.get(w["worksheet_id"], {}).get("questions")

    by_student = defaultdict(list)
    for w in worksheets:
        by_student[w["user_id"]].append(w)

    return transform, by_student, worksheets


def list_students():
    """Every enrolled student, with how much reference work backs their
    signature.

    Needed to use the tool at all: --cohort takes student ids, and the ranking
    comes back as student ids, so there has to be a way to see which ids exist
    and how well each is supported. Worksheet and date counts are shown because
    a signature built from two worksheets on one day describes that sitting
    rather than the student -- case1_identification.md asks for 4+ worksheets
    across 3+ dates, and this is where you check that.
    """
    _, by_student, _ = build_index()
    meta = confound_diagnosis.load_metadata()

    rows = []
    for student, group in by_student.items():
        dates = {meta.get(w["worksheet_id"], {}).get("date") for w in group}
        dates.discard(None)
        rows.append(
            {
                "student_id": student,
                "worksheets": len(group),
                "distinct_dates": len(dates),
                "pages": sum(w.get("n_pages", 1) for w in group),
                "meets_reference_bar": len(group) >= 4 and len(dates) >= 3,
            }
        )
    rows.sort(key=lambda r: (-r["worksheets"], r["student_id"]))
    return rows


def cohorts_available():
    """Worksheets sat by more than one student -- the realistic candidate sets.

    --cohort is meant to hold the students actually assigned one worksheet,
    since that is the configuration the 85.3% figure was measured in. This
    shows which such groups exist in the fetched data, so a cohort can be
    copied straight out rather than guessed at.
    """
    _, by_student, worksheets = build_index()
    meta = confound_diagnosis.load_metadata()

    by_questions = defaultdict(set)
    for w in worksheets:
        questions = meta.get(w["worksheet_id"], {}).get("questions")
        if questions:
            by_questions[questions].add(w["user_id"])

    groups = [
        {"students": sorted(members), "size": len(members)}
        for members in by_questions.values()
        if len(members) > 1
    ]
    groups.sort(key=lambda g: -g["size"])
    return groups


def fingerprint_image(source):
    raw = Path(source).read_bytes() if Path(source).exists() else fetch_bytes(source)
    gray = features.decode_gray(raw)
    if gray is None:
        raise ValueError(f"could not decode an image from {source}")
    fingerprint = features.extract_fingerprint(gray)
    if fingerprint is None or fingerprint["ink_px"] < MIN_INK_PX:
        ink = fingerprint["ink_px"] if fingerprint else 0
        raise ValueError(
            f"too little ink to fingerprint ({ink} px, floor {MIN_INK_PX}). "
            "Declining to guess rather than returning a meaningless ranking."
        )
    return fingerprint


def confidence_from_margin(distances):
    """Turn the gap between the top two candidates into a 0-100 confidence.

    Absolute distance says little on its own -- it drifts with how much ink the
    page carries. The *relative* margin to the runner-up is what separates "this
    is clearly one person" from "these two are indistinguishable", and it is the
    diagnostic case1_identification.md asks for by name.
    """
    if len(distances) < 2:
        return None, None
    best, runner_up = distances[0], distances[1]
    if runner_up <= 0:
        return None, None
    margin = (runner_up - best) / runner_up
    return round(float(min(margin * 400, 100)), 1), round(float(margin * 100), 1)


def identify(source, cohort=None, submitted_by=None):
    transform, by_student, _ = build_index()

    # The query must not be scored against a signature it helped build, and a
    # candidate must not win by having written the same words -- the same
    # content-blind rule the measured 85.3% was obtained under.
    query_fingerprint = fingerprint_image(source)
    query_vector = transform.transform(evaluate_vector(query_fingerprint))

    candidates = sorted(cohort) if cohort else sorted(by_student)
    unknown = [c for c in candidates if c not in by_student]
    candidates = [c for c in candidates if c in by_student]
    if len(candidates) < 2:
        raise ValueError("need at least 2 enrolled candidates to rank")

    scored = []
    for student in candidates:
        group = by_student[student]
        signature = np.mean(np.vstack([w["projected"] for w in group]), axis=0)
        scored.append((metrics.euclidean_distance(query_vector, signature), student))
    scored.sort()

    distances = [d for d, _ in scored]
    confidence, margin_pct = confidence_from_margin(distances)

    result = {
        "image": source,
        "ink_px": query_fingerprint["ink_px"],
        "candidates_considered": len(candidates),
        "random_baseline_pct": round(100.0 / len(candidates), 1),
        "looks_like": scored[0][1],
        "confidence": confidence,
        "margin_to_runner_up_pct": margin_pct,
        "runner_up": scored[1][1] if len(scored) > 1 else None,
        "ranking": [
            {"student_id": s, "distance": round(d, 4), "rank": i}
            for i, (d, s) in enumerate(scored[:10], 1)
        ],
        "closed_set": True,
        "caveats": [
            "Closed-set: assumes the writer is one of the candidates. If the page "
            "was written by someone not enrolled, the top match is wrong, not absent.",
            "Ranking only -- not a verdict. 14.7% of genuine submissions rank "
            "someone else first in the measured deployment configuration.",
        ],
    }
    if unknown:
        result["candidates_without_history"] = unknown
    if submitted_by:
        rank = next((i for i, (_, s) in enumerate(scored, 1) if s == submitted_by), None)
        result["submitted_by"] = submitted_by
        result["submitter_rank"] = rank
        result["submitter_is_top_match"] = rank == 1
        if rank is None:
            result["submitter_note"] = "submitter has no history; cannot be ranked"
    return result


def evaluate_vector(fingerprint):
    """Fingerprint dict -> the vector layout build_index() fitted on: scalar
    block z-scored against the corpus, Hinge block left as raw probabilities.
    """
    raw = features.flatten(fingerprint)
    stats = _corpus_scalar_stats()
    scalars = raw[: metrics.N_SCALARS]
    scalars = np.where(np.isnan(scalars), stats["mean"], scalars)
    z = np.where(stats["std"] > 1e-9, (scalars - stats["mean"]) / np.where(stats["std"] > 1e-9, stats["std"], 1.0), 0.0)
    return np.concatenate([z, raw[metrics.N_SCALARS:]])


_SCALAR_STATS = None


def _corpus_scalar_stats():
    """Scalar mean/std over the enrolled corpus, so a new page is standardized
    the same way the signatures were. Cached: this reads the whole cache.
    """
    global _SCALAR_STATS
    if _SCALAR_STATS is None:
        import main
        items, _, _ = main.load_items(cache_only=True)
        stacked = np.vstack([i["raw_vector"][: metrics.N_SCALARS] for i in items])
        _SCALAR_STATS = {
            "mean": np.nanmean(stacked, axis=0),
            "std": np.nanstd(stacked, axis=0),
        }
    return _SCALAR_STATS


def main_cli():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("image", nargs="?", help="image url or local path")
    parser.add_argument("--list-students", action="store_true",
                        help="list enrolled student ids and how much reference "
                             "work backs each signature, then exit")
    parser.add_argument("--list-cohorts", action="store_true",
                        help="list worksheets sat by more than one student, as "
                             "ready-made --cohort arguments, then exit")
    parser.add_argument("--cohort", nargs="+", default=None,
                        help="restrict candidates to these student ids (the realistic "
                             "setting: the students assigned this worksheet)")
    parser.add_argument("--submitted-by", default=None,
                        help="who handed it in; reports where they ranked")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    if args.list_students:
        rows = list_students()
        if args.json:
            print(json.dumps(rows, indent=2))
            return
        qualified = sum(1 for r in rows if r["meets_reference_bar"])
        print(f"\n{len(rows)} enrolled students "
              f"({qualified} with 4+ worksheets across 3+ dates)\n")
        print(f"{'student_id':26} {'worksheets':>10} {'dates':>6} {'pages':>6}  reference")
        for row in rows:
            bar = "ok" if row["meets_reference_bar"] else "THIN"
            print(f"{row['student_id']:26} {row['worksheets']:>10} "
                  f"{row['distinct_dates']:>6} {row['pages']:>6}  {bar}")
        print("\nPass any of these to --cohort. THIN means the signature rests on")
        print("too little work to be trusted (case1_identification.md: 4+ worksheets,")
        print("3+ dates) -- such a student can still be ranked, just not relied on.")
        return

    if args.list_cohorts:
        groups = cohorts_available()
        if args.json:
            print(json.dumps(groups, indent=2))
            return
        print(f"\n{len(groups)} worksheets were sat by more than one student.\n")
        for group in groups[:15]:
            print(f"  {group['size']} students:")
            print(f"    --cohort {' '.join(group['students'])}\n")
        return

    if not args.image:
        parser.error("an image is required unless --list-students or --list-cohorts is given")

    try:
        result = identify(args.image, args.cohort, args.submitted_by)
    except ValueError as exc:
        print(f"Cannot identify: {exc}", file=sys.stderr)
        sys.exit(2)

    if args.json:
        print(json.dumps(result, indent=2))
        return

    print(f"\nImage        : {result['image']}")
    print(f"Candidates   : {result['candidates_considered']} "
          f"(random baseline {result['random_baseline_pct']}%)")
    print(f"\nLooks most like : {result['looks_like']}")
    print(f"Confidence      : {result['confidence']}   "
          f"(margin to runner-up {result['margin_to_runner_up_pct']}%)")
    if result.get("submitter_rank"):
        flag = "matches submitter" if result["submitter_is_top_match"] else "DOES NOT match submitter"
        print(f"Submitted by    : {result['submitted_by']} -- ranked #{result['submitter_rank']} ({flag})")

    print(f"\n{'rank':>4}  {'student_id':26} {'distance':>9}")
    for row in result["ranking"][:5]:
        print(f"{row['rank']:>4}  {row['student_id']:26} {row['distance']:>9.4f}")

    print("\nCaveats:")
    for caveat in result["caveats"]:
        print(f"  - {caveat}")


if __name__ == "__main__":
    main_cli()
