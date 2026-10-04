#!/usr/bin/env python3
"""The number that actually matters: accuracy in the deployment configuration.

Everything measured so far ranks a query against all 105 enrolled students,
whose worksheets span many topics and dates. That is not how this would run.

In production the question is: this page was handed in for worksheet W by
student C -- of the students who were assigned W, whose handwriting is it?
The candidate set is one class doing one piece of homework on one day, which
is exactly the configuration confound_diagnosis.py flagged as worst: every
candidate shares the words, the day, the notebook and the capture batch with
the query.

So this restricts candidates to the students who did the same worksheet, and
builds each candidate's signature only from their *other*, content-disjoint
worksheets -- the true writer stays rankable, but cannot be ranked by having
written the same words.

Also reports the random baseline per cohort, because a class of 4 is a much
easier guess than 105 students and the headline number must not be compared
across the two.

Uses cached fingerprints only, no network.
"""

from collections import defaultdict

import numpy as np

import confound_diagnosis
import evaluate
import metrics

TRANSFORM = "sqrt+pca"


def main_cli():
    evaluate.restrict_to_shared_pages("features", "features_v2")
    worksheets = evaluate.load_worksheets()
    meta = confound_diagnosis.load_metadata()

    transform = metrics.TRANSFORMS[TRANSFORM]().fit([w["vector"] for w in worksheets])
    for w in worksheets:
        w["projected"] = transform.transform(w["vector"])
        info = meta.get(w["worksheet_id"], {})
        w["questions"], w["date"] = info.get("questions"), info.get("date")

    worksheets = [w for w in worksheets if w["questions"]]
    by_student = defaultdict(list)
    for w in worksheets:
        by_student[w["user_id"]].append(w)

    # who did each worksheet
    cohort = defaultdict(set)
    for w in worksheets:
        cohort[w["questions"]].add(w["user_id"])

    for content_blind in (False, True):
        ranks, cohort_sizes, randoms = [], [], []
        for query in worksheets:
            peers = cohort[query["questions"]]
            if len(peers) < 2:
                continue  # nobody else did this worksheet; no cohort to rank in

            signatures, labels = [], []
            for student in sorted(peers):
                group = [
                    w for w in by_student[student]
                    if w["worksheet_id"] != query["worksheet_id"]
                    and not (content_blind and w["questions"] == query["questions"])
                ]
                if not group:
                    continue
                signatures.append(np.mean(np.vstack([w["projected"] for w in group]), axis=0))
                labels.append(student)

            if query["user_id"] not in labels or len(labels) < 2:
                continue

            distances = np.linalg.norm(np.vstack(signatures) - query["projected"], axis=1)
            order = np.argsort(distances)
            ranks.append(int(np.where(np.array(labels)[order] == query["user_id"])[0][0]) + 1)
            cohort_sizes.append(len(labels))
            randoms.append(1.0 / len(labels))

        ranks = np.array(ranks)
        top1 = float((ranks == 1).mean())
        baseline = float(np.mean(randoms))
        label = "content-blind signatures" if content_blind else "all worksheets in signature"
        print(f"\n{label}")
        print(f"  queries scored      : {len(ranks)}")
        print(f"  median cohort size  : {int(np.median(cohort_sizes))} students "
              f"(range {min(cohort_sizes)}-{max(cohort_sizes)})")
        print(f"  top-1               : {top1:.1%}")
        print(f"  random baseline     : {baseline:.1%}")
        print(f"  lift                : {top1 / baseline:.1f}x")
        print(f"  true writer ranked 1st or 2nd: {float((ranks <= 2).mean()):.1%}")


if __name__ == "__main__":
    main_cli()
