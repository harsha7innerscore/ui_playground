#!/usr/bin/env python3
"""How much real separation is there, on a 0-to-1 scale, not just pass/fail?

gate.verdict()'s rule (same_day median below the other bucket's 25th
percentile) demands near-total separation and is easy to fail even when real,
useful signal exists -- especially at our sample sizes, where percentiles are
noisy. This computes the AUC (Mann-Whitney statistic): the probability that a
random same_student_diff_day pair scores lower (more similar) than a random
pair from the comparison bucket.

0.50 = no signal, pure coin flip. 1.00 = perfect separation. For reference,
published text-independent writer-ID systems report AUC-equivalent accuracy
in the 0.85-0.97 range on clean data (see commit sources) -- useful to know
roughly where "good" sits, not as a target this noisier dataset must hit.

Uses cached fingerprints only, no network.
"""

import numpy as np

import gate
import main
from diagnose_features import aggregate_by_worksheet


def auc(a, b):
    """P(random a < random b), i.e. fraction of (same_day, other) pairs where
    same_day is the more-similar (lower) score. O(len(a)*len(b)); fine at our
    scale (hundreds x thousands).
    """
    a = np.asarray(a)
    b = np.asarray(b)
    wins = (a[:, None] < b[None, :]).sum() + 0.5 * (a[:, None] == b[None, :]).sum()
    return float(wins / (len(a) * len(b)))


def main_cli():
    items, total, skipped = main.load_items()
    print(f"Loaded {len(items)}/{total} pages ({skipped} skipped) from cache\n")

    worksheet_items = aggregate_by_worksheet(items)
    vectors = gate.standardize([item["raw_vector"] for item in worksheet_items])
    for item, vec in zip(worksheet_items, vectors):
        item["vector"] = vec

    buckets = gate.build_buckets(worksheet_items)
    same_day = buckets["same_student_diff_day"]
    same_content = buckets["diff_student_same_content"]
    general = buckets["diff_student_general"]

    print(f"same_student_diff_day   n={len(same_day)}")
    print(f"diff_student_same_content n={len(same_content)}")
    print(f"diff_student_general     n={len(general)}\n")

    print(f"AUC(same_day vs diff_general)      = {auc(same_day, general):.3f}  (0.5=no signal, 1.0=perfect)")
    print(f"AUC(same_day vs diff_same_content) = {auc(same_day, same_content):.3f}  <- the specific confound check")
    print(f"AUC(diff_same_content vs diff_general) = {auc(same_content, general):.3f}  <- is same_content distinct from random at all")


if __name__ == "__main__":
    main_cli()
