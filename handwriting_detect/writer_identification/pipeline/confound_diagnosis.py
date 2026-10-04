#!/usr/bin/env python3
"""Is the confound the words, or the day the page was captured?

evaluate.py reports AUCcon = 0.432: two different students who did the same
worksheet produce *more similar* fingerprints than one student's own work on
two different days. That is below chance and it got worse with more data.

Before fixing it, it has to be attributed, because the bucket that measured it
is ambiguous. gate.py's content_key is "subject:topic:date", so two students
sharing it share their words -- but they also share the same day, the same
class, very likely the same notebook, and the same capture batch. Problem 2
established that shared-environment effects on this data are large enough to
flood every pair in a classroom at once. A fix for leaked content (change the
feature) and a fix for leaked paper/capture (change the ink mask) have nothing
in common, so guessing wrong wastes the work.

The worksheet documents carry the actual question_ids, so content identity can
be stated exactly instead of proxied. That allows the two causes to be pulled
apart:

    same questions, same day        content + day   (what AUCcon measured)
    same questions, different day   content only
    different questions, same day   day only
    different questions, diff day   neither -- the baseline

Read it like this:
  - "different questions, same day" as tight as "same questions, same day"
        -> it is the DAY. Shared paper, lighting, scan batch. Not content.
  - "same questions, different day" tight, "different questions, same day" not
        -> it is genuinely the WORDS. Text-dependence in the feature.
  - both tight -> both are present and both need handling.

Uses cached fingerprints only, no network.
"""

import json
from collections import defaultdict
from itertools import combinations
from pathlib import Path

import numpy as np

import evaluate
import metrics

OUTPUT_DIR = Path(__file__).resolve().parent / "output"
MAX_PAIRS = 6000
TRANSFORM = "sqrt+pca"  # the current best, per evaluate.py


def question_key(doc):
    """Exact content identity: the sorted set of question_ids on the sheet.

    Stronger than gate.py's subject:topic:date proxy -- two worksheets with
    this key really do pose the same questions, so a pair sharing it shares
    its words by construction rather than by inference.
    """
    questions = doc.get("questions") or []
    ids = sorted(str(q.get("question_id")) for q in questions if q.get("question_id"))
    return "|".join(ids) if ids else None


def load_metadata():
    """worksheet_id -> {questions, date} from the history file."""
    with evaluate.main.HISTORY_FILE.open() as f:
        history = json.load(f)
    meta = {}
    for docs in history.values():
        for doc in docs:
            meta[doc.get("worksheet_id")] = {
                "questions": question_key(doc),
                "date": str(doc.get("created_at"))[:10],
            }
    return meta


def auc(a, b):
    a, b = np.asarray(a), np.asarray(b)
    if not len(a) or not len(b):
        return float("nan")
    wins = (a[:, None] < b[None, :]).sum() + 0.5 * (a[:, None] == b[None, :]).sum()
    return float(wins / (len(a) * len(b)))


def main_cli():
    worksheets = evaluate.load_worksheets()
    meta = load_metadata()

    transform = metrics.TRANSFORMS[TRANSFORM]().fit([w["vector"] for w in worksheets])
    for w in worksheets:
        w["projected"] = transform.transform(w["vector"])
        info = meta.get(w["worksheet_id"], {})
        w["questions"] = info.get("questions")
        w["date"] = info.get("date")

    usable = [w for w in worksheets if w["questions"] and w["date"]]
    print(f"{len(usable)}/{len(worksheets)} worksheets carry question ids and a date")

    shared = defaultdict(int)
    for w in usable:
        shared[w["questions"]] += 1
    multi = {k: v for k, v in shared.items() if v > 1}
    print(f"{len(multi)} question-sets are shared by more than one worksheet "
          f"(covering {sum(multi.values())} worksheets)\n")

    buckets = defaultdict(list)
    rng = np.random.default_rng(0)
    pairs = list(combinations(range(len(usable)), 2))
    rng.shuffle(pairs)

    for i, j in pairs:
        a, b = usable[i], usable[j]
        if a["worksheet_id"] == b["worksheet_id"]:
            continue
        same_student = a["user_id"] == b["user_id"]
        same_questions = a["questions"] == b["questions"]
        same_day = a["date"] == b["date"]

        if same_student:
            name = "SAME student, different day" if not same_day else "SAME student, same day"
        elif same_questions and same_day:
            name = "diff student: same questions, same day"
        elif same_questions:
            name = "diff student: same questions, DIFF day"
        elif same_day:
            name = "diff student: DIFF questions, same day"
        else:
            name = "diff student: diff questions, diff day"

        if len(buckets[name]) >= MAX_PAIRS:
            continue
        buckets[name].append(
            metrics.euclidean_distance(a["projected"], b["projected"])
        )

    order = [
        "SAME student, same day",
        "SAME student, different day",
        "diff student: same questions, same day",
        "diff student: same questions, DIFF day",
        "diff student: DIFF questions, same day",
        "diff student: diff questions, diff day",
    ]

    print(f"{'bucket':44} {'n':>6} {'median':>8} {'p25':>8}")
    print("-" * 70)
    for name in order:
        values = buckets.get(name, [])
        if not values:
            print(f"{name:44} {'0':>6}   (no pairs)")
            continue
        arr = np.array(values)
        print(f"{name:44} {len(arr):>6} {np.median(arr):>8.3f} {np.percentile(arr, 25):>8.3f}")

    key = buckets.get("SAME student, different day", [])
    print(f"\nAUC of 'SAME student, different day' against each control")
    print("(0.5 = no separation; BELOW 0.5 = the control is tighter than a real writer match)")
    results = {}
    for name in order[2:]:
        if not buckets.get(name) or not key:
            continue
        value = auc(key, buckets[name])
        results[name] = value
        verdict = "OK" if value > 0.55 else ("CHANCE" if value > 0.48 else "REVERSED")
        print(f"  vs {name:44} {value:>6.3f}  {verdict}")

    content_only = results.get("diff student: same questions, DIFF day")
    day_only = results.get("diff student: DIFF questions, same day")
    print("\nAttribution:")
    if content_only is not None and day_only is not None:
        if day_only < 0.5 and content_only >= 0.5:
            print("  The DAY, not the words. Shared paper/lighting/scan batch is leaking")
            print("  into the ink mask. Fix belongs in features.ink_mask, not the feature.")
        elif content_only < 0.5 and day_only >= 0.5:
            print("  The WORDS. The feature is still text-dependent on short answers.")
        elif content_only < 0.5 and day_only < 0.5:
            print("  BOTH are leaking, and both need separate handling.")
        else:
            print("  Neither control is reversed on its own -- the original AUCcon")
            print("  reversal came from their combination.")

    OUTPUT_DIR.mkdir(exist_ok=True)
    out = OUTPUT_DIR / "confound_diagnosis.json"
    with out.open("w") as f:
        json.dump(
            {
                "transform": TRANSFORM,
                "bucket_medians": {k: float(np.median(v)) for k, v in buckets.items() if v},
                "bucket_n": {k: len(v) for k, v in buckets.items()},
                "auc_vs_same_student_diff_day": results,
            },
            f,
            indent=2,
        )
    print(f"\nWritten to {out}")


if __name__ == "__main__":
    main_cli()
