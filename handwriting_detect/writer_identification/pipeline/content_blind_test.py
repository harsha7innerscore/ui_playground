#!/usr/bin/env python3
"""Does building signatures from content-disjoint worksheets remove the leak?

The confound decomposition (confound_diagnosis.py) showed two independent
leaks, each individually outweighing writer identity: shared words, and shared
capture day. Scale normalization was tried against the day half and did
nothing. This targets the content half, at scoring time rather than in the
feature.

The idea, and the correction it rests on
----------------------------------------
Session 1 deferred an option phrased as "exclude or down-weight any candidate
who shares a worksheet with the page being checked". That is wrong for the
scenario the product exists to catch: when C submits a paper A wrote, A did
the *same assigned worksheet* as C. Excluding same-worksheet candidates
removes the true writer from the candidate list entirely.

The fix belongs one level down. Keep every candidate, but build each
candidate's signature only from worksheets whose questions differ from the
query's. A then stays rankable, while the evidence that ranks them can no
longer be "these two pages contain the same words".

Reported both ways so the cost is visible: making signatures content-blind
discards real reference material, so if accuracy falls, that is the price of
the leak being removed rather than the method failing.

Uses cached fingerprints only, no network.
"""

import json
from collections import defaultdict

import numpy as np

import confound_diagnosis
import evaluate
import metrics

TRANSFORM = "sqrt+pca"


def run(worksheets, content_blind):
    """Leave-one-out ranking. content_blind drops, from every candidate's
    signature, any worksheet posing the same questions as the query.
    """
    by_student = defaultdict(list)
    for w in worksheets:
        by_student[w["user_id"]].append(w)
    students = sorted(by_student)

    ranks = []
    skipped = 0
    for held_out in worksheets:
        owner = held_out["user_id"]

        signatures, labels = [], []
        for student in students:
            group = [
                w for w in by_student[student]
                if w["worksheet_id"] != held_out["worksheet_id"]
                and not (content_blind and w["questions"] == held_out["questions"])
            ]
            if not group:
                continue
            signatures.append(np.mean(np.vstack([w["projected"] for w in group]), axis=0))
            labels.append(student)

        if owner not in labels:
            skipped += 1  # no content-disjoint reference left for the true writer
            continue

        distances = np.linalg.norm(np.vstack(signatures) - held_out["projected"], axis=1)
        order = np.argsort(distances)
        ranks.append(int(np.where(np.array(labels)[order] == owner)[0][0]) + 1)

    ranks = np.array(ranks)
    return {
        "queries": len(ranks),
        "skipped": skipped,
        "candidates": len(students),
        "top1": float((ranks == 1).mean()),
        "top5": float((ranks <= 5).mean()),
        "mrr": float((1.0 / ranks).mean()),
        "lift": float((ranks == 1).mean()) * len(students),
    }


def main_cli():
    evaluate.restrict_to_shared_pages("features", "features_v2")
    worksheets = evaluate.load_worksheets()
    meta = confound_diagnosis.load_metadata()

    transform = metrics.TRANSFORMS[TRANSFORM]().fit([w["vector"] for w in worksheets])
    for w in worksheets:
        w["projected"] = transform.transform(w["vector"])
        w["questions"] = meta.get(w["worksheet_id"], {}).get("questions")

    worksheets = [w for w in worksheets if w["questions"]]
    print(f"{len(worksheets)} worksheets with question ids, "
          f"{len({w['user_id'] for w in worksheets})} students\n")

    print(f"{'signatures':34} {'queries':>8} {'skipped':>8} {'top1':>7} {'top5':>7} {'lift':>7}")
    print("-" * 76)
    for label, blind in (("all worksheets (current)", False),
                         ("content-disjoint only", True)):
        r = run(worksheets, blind)
        print(f"{label:34} {r['queries']:>8} {r['skipped']:>8} "
              f"{r['top1']:>6.1%} {r['top5']:>6.1%} {r['lift']:>6.1f}x")

    print("\nA drop here is the leak being paid for, not the method failing:")
    print("content-blind signatures discard real reference pages. The question is")
    print("how much of the current accuracy was resting on shared words.")


if __name__ == "__main__":
    main_cli()
