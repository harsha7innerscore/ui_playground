"""The go/no-go gate: do fingerprints track the hand, or the paper?

Per ../case1_identification.md and ../case2_verification.md, one question
decides whether either case is worth building: does a student's own writing,
measured on a *different day*, still sit closer to their own writing than to
a stranger's?

Four buckets of page-pairs, built from data already fetched -- no new
download beyond what main.py needs for fingerprints:

  same_sitting        same student, same worksheet.       Tightest -- proves
                       little on its own, a shared sheet/scan/lighting would
                       produce this even with no handwriting signal at all.
  same_student_diff_day
                       same student, different worksheet, different date.
                       THE row that matters. Must sit clearly closer to
                       same_sitting than to diff_student_general below it.
  diff_student_same_content
                       different students, same (subject_id, topic_name_id,
                       date) -- the whole class did the identical worksheet
                       that day. Free control: if this scores as tight as
                       same_student_diff_day, the fingerprint is reading the
                       worksheet template, not the hand.
  diff_student_general
                       different students, unrestricted. The baseline
                       "two random people" distance.

Pass condition: median(same_student_diff_day) must sit clearly below
median(diff_student_general), and clearly below median(diff_student_same_content)
too -- otherwise bucket 3 shows the same collapse bucket 2 is being checked for.
"""

import random
from itertools import combinations

import numpy as np

BUCKET_ORDER = [
    "same_sitting",
    "same_student_diff_day",
    "diff_student_same_content",
    "diff_student_general",
]

MAX_PAIRS_PER_BUCKET = 4000


def standardize(vectors):
    """Z-score each feature dimension across the whole sample, ignoring NaNs
    (a feature that couldn't be computed for one page shouldn't shift the
    scale for every other page). Dimensions with ~zero variance are left at 0
    for every item rather than divided by near-zero.
    """
    stacked = np.vstack(vectors)
    mean = np.nanmean(stacked, axis=0)
    std = np.nanstd(stacked, axis=0)
    std_safe = np.where(std > 1e-9, std, 1.0)
    standardized = (stacked - mean) / std_safe
    standardized = np.where(std[None, :] > 1e-9, standardized, 0.0)
    return [standardized[i] for i in range(standardized.shape[0])]


def distance(a, b):
    """Euclidean distance over dimensions both sides actually have (NaN-safe).
    Returns None if too few shared dimensions to mean anything. The minimum is
    3, or the full length for short vectors -- this doubles as the per-feature
    diagnostic's 1-D distance (diagnose_features.py), where requiring 3 shared
    dims out of 1 would reject every pair.
    """
    shared = ~(np.isnan(a) | np.isnan(b))
    min_shared = min(3, len(a))
    if shared.sum() < min_shared:
        return None
    diff = a[shared] - b[shared]
    # scale back up to the full dimensionality so a pair missing a few
    # features isn't penalized or rewarded relative to a complete pair
    return float(np.sqrt(np.sum(diff ** 2) * (len(a) / shared.sum())))


def build_buckets(items, seed=0, distance_fn=None):
    """items: list of dicts with user_id, worksheet_id, content_key, vector.
    Returns {bucket_name: [distances]}.

    distance_fn lets a caller supply a different metric (see metrics.py) while
    keeping bucket construction identical, so two metrics can be compared on
    exactly the same pairs rather than on separately-sampled ones. Defaults to
    the z-scored Euclidean this module has always used.
    """
    rng = random.Random(seed)
    if distance_fn is None:
        distance_fn = distance
    buckets = {name: [] for name in BUCKET_ORDER}

    by_worksheet = {}
    for item in items:
        by_worksheet.setdefault(item["worksheet_id"], []).append(item)

    # same_sitting: pairs within one worksheet (same student, same sitting by
    # construction -- one worksheet belongs to one student).
    for group in by_worksheet.values():
        for a, b in combinations(group, 2):
            d = distance_fn(a["vector"], b["vector"])
            if d is not None:
                buckets["same_sitting"].append(d)

    # remaining buckets need cross-worksheet pairs; sample rather than
    # enumerate all C(n,2) since diff_student_general is quadratic in the
    # full page count.
    all_pairs_idx = list(combinations(range(len(items)), 2))
    rng.shuffle(all_pairs_idx)

    counts = {name: 0 for name in BUCKET_ORDER if name != "same_sitting"}
    for i, j in all_pairs_idx:
        if all(counts[name] >= MAX_PAIRS_PER_BUCKET for name in counts):
            break
        a, b = items[i], items[j]
        if a["worksheet_id"] == b["worksheet_id"]:
            continue  # already in same_sitting

        same_student = a["user_id"] == b["user_id"]
        same_content = a["content_key"] == b["content_key"]

        if same_student:
            name = "same_student_diff_day"
        elif same_content:
            name = "diff_student_same_content"
        else:
            name = "diff_student_general"

        if counts[name] >= MAX_PAIRS_PER_BUCKET:
            continue

        d = distance_fn(a["vector"], b["vector"])
        if d is not None:
            buckets[name].append(d)
            counts[name] += 1

    return buckets


def summarize(buckets):
    summary = {}
    for name in BUCKET_ORDER:
        values = buckets.get(name, [])
        if not values:
            summary[name] = {"n": 0}
            continue
        arr = np.array(values)
        summary[name] = {
            "n": len(arr),
            "min": round(float(arr.min()), 3),
            "p25": round(float(np.percentile(arr, 25)), 3),
            "median": round(float(np.median(arr)), 3),
            "p75": round(float(np.percentile(arr, 75)), 3),
            "max": round(float(arr.max()), 3),
        }
    return summary


def verdict(summary):
    """Pass requires same_student_diff_day to sit clearly below both
    diff_student buckets. 'Clearly' = its median is below their 25th
    percentile -- the two distributions barely overlap, not just differ on
    average.
    """
    key_row = summary.get("same_student_diff_day", {})
    if key_row.get("n", 0) == 0:
        return "INCONCLUSIVE", "no same_student_diff_day pairs available"

    key_median = key_row["median"]
    checks = {}
    for other in ("diff_student_general", "diff_student_same_content"):
        other_row = summary.get(other, {})
        if other_row.get("n", 0) == 0:
            checks[other] = None
            continue
        checks[other] = key_median < other_row["p25"]

    if checks.get("diff_student_general") is False:
        return "FAIL", "same-student-different-day does not separate from different students at all"

    if checks.get("diff_student_same_content") is False:
        return "FAIL", "fingerprint tracks the worksheet content, not the hand (same-content control collapsed onto same-student)"

    if all(v for v in checks.values() if v is not None):
        return "PASS", "same-student-different-day separates clearly from both control buckets"

    return "WEAK", "separates from the general baseline but margins are thin -- eyeball before trusting"
