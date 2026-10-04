#!/usr/bin/env python3
"""Which individual features, if any, carry a writer-identity signal?

The combined-vector gate in main.py failed: same_student_diff_day did not
separate from diff_student_general. Two different explanations produce the
same failed combined result, and they call for opposite next steps:

  (a) no single feature carries signal -- the features themselves don't
      capture handwriting on this data, extend/replace them.
  (b) a few features do carry signal, but noisy ones (large variance, no
      discriminative power) dilute them in a plain Euclidean sum over all 29
      dimensions equally weighted.

Reruns the same four buckets one feature at a time, using cached fingerprints
only (no network). For each feature, reports whether same_student_diff_day
sits below diff_student_general's p25 -- the same bar main.py's combined gate
uses -- so individual features are judged consistently with it.
"""

import numpy as np

import features
import gate
import main


def per_feature_items(items, vector_key, feature_index):
    return [dict(item, vector=np.array([item[vector_key][feature_index]])) for item in items]


def aggregate_by_worksheet(items):
    by_worksheet = {}
    for item in items:
        by_worksheet.setdefault(item["worksheet_id"], []).append(item)
    out = []
    for worksheet_id, group in by_worksheet.items():
        stacked = np.vstack([g["raw_vector"] for g in group])
        mean_vector = np.nanmean(stacked, axis=0)
        out.append(
            {
                "user_id": group[0]["user_id"],
                "worksheet_id": worksheet_id,
                "content_key": group[0]["content_key"],
                "raw_vector": mean_vector,
            }
        )
    return out


def main_cli():
    items, total, skipped = main.load_items()
    print(f"Loaded {len(items)}/{total} pages ({skipped} skipped) from cache\n")

    worksheet_items = aggregate_by_worksheet(items)
    print(f"Aggregated to {len(worksheet_items)} worksheets\n")

    print(f"{'feature':24} {'same_day_med':>13} {'diff_stu_med':>13} {'diff_stu_p25':>13}  separates?")
    results = []
    for idx, name in enumerate(features.FEATURE_NAMES):
        standardized = gate.standardize([item["raw_vector"] for item in worksheet_items])
        items_1d = per_feature_items(
            [dict(item, raw_vector=vec) for item, vec in zip(worksheet_items, standardized)],
            "raw_vector",
            idx,
        )
        buckets = gate.build_buckets(items_1d)
        summary = gate.summarize(buckets)

        same_day = summary.get("same_student_diff_day", {})
        diff_stu = summary.get("diff_student_general", {})
        if same_day.get("n", 0) == 0 or diff_stu.get("n", 0) == 0:
            print(f"{name:24} -- not enough pairs --")
            continue

        separates = same_day["median"] < diff_stu["p25"]
        results.append((name, same_day["median"], diff_stu["median"], diff_stu["p25"], separates))
        flag = "YES" if separates else ""
        print(
            f"{name:24} {same_day['median']:>13} {diff_stu['median']:>13} "
            f"{diff_stu['p25']:>13}  {flag}"
        )

    winners = [r for r in results if r[4]]
    print(f"\n{len(winners)}/{len(results)} features separate on their own (same_day median < diff_student p25)")
    if winners:
        print("Features worth keeping / upweighting:", ", ".join(w[0] for w in winners))
    else:
        print("No individual feature separates. The feature set itself, not the combination, is the problem.")


if __name__ == "__main__":
    main_cli()
