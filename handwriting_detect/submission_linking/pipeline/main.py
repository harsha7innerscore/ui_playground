#!/usr/bin/env python3
"""Problem 2 orchestrator: submissions.json -> per-task link report.

Usage:
    python3 main.py <submissions_json> <task_id>

<submissions_json> is the output/<task_id>_submissions.json produced by
../../scripts/get_task_worksheets/fetch_task_worksheets.py: a flat list of
{user_id, journey_id, worksheet_id, image_urls}.

Follows the build order in ../README.md:
  1. extract features once per image, cached by url
  2. compare every cross-student image pair
  3. baseline-suppress clues that fire for most of this task (shared classroom)
  4. classify + aggregate image-pairs into student-pairs (max score)
  5. group linked students, write the per-task report
"""

import hashlib
import json
import sys
from datetime import datetime
from itertools import combinations
from pathlib import Path

import requests

from classify import classify_pair
from grouping import group_links
from scoring import score_pair
from suppression import compute_suppressed_clues
from s3_timing import get_last_modified, seconds_apart
from features import extract_features

SCRIPT_DIR = Path(__file__).resolve().parent
CACHE_DIR = SCRIPT_DIR / "cache"
OUTPUT_DIR = SCRIPT_DIR / "output"


def url_key(url):
    return hashlib.md5(url.encode()).hexdigest()


def cached_json(path, compute):
    if path.exists():
        with path.open() as f:
            return json.load(f)
    result = compute()
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w") as f:
        json.dump(result, f)
    return result


def get_features(url):
    path = CACHE_DIR / "features" / f"{url_key(url)}.json"

    def compute():
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
        return extract_features(resp.content)

    return cached_json(path, compute)


def get_timestamp(url):
    path = CACHE_DIR / "timing" / f"{url_key(url)}.json"

    def compute():
        dt = get_last_modified(url)
        return {"iso": dt.isoformat() if dt else None}

    return cached_json(path, compute)["iso"]


def flatten_images(submissions):
    images = []
    for sub in submissions:
        for url in sub["image_urls"]:
            images.append({"user_id": sub["user_id"], "worksheet_id": sub["worksheet_id"], "url": url})
    return images


def main():
    if len(sys.argv) != 3:
        print("Usage: python3 main.py <submissions_json> <task_id>", file=sys.stderr)
        sys.exit(1)

    submissions_path, task_id = sys.argv[1], sys.argv[2]
    with open(submissions_path) as f:
        submissions = json.load(f)

    images = flatten_images(submissions)
    print(f"{len(images)} image(s) across {len(submissions)} submission(s)")

    for img in images:
        img["features"] = get_features(img["url"])
        img["timestamp"] = get_timestamp(img["url"])
    print("Feature extraction + timestamps done (cached by url).")

    image_pairs = [
        (a, b) for a, b in combinations(images, 2) if a["user_id"] != b["user_id"]
    ]
    print(f"{len(image_pairs)} cross-student image pair(s) to score.")

    raw_results = []
    for a, b in image_pairs:
        dt_a = datetime.fromisoformat(a["timestamp"]) if a["timestamp"] else None
        dt_b = datetime.fromisoformat(b["timestamp"]) if b["timestamp"] else None
        signals = score_pair(a["features"], b["features"], seconds_apart(dt_a, dt_b))
        raw_results.append((a, b, signals))

    suppressed = compute_suppressed_clues([signals for _, _, signals in raw_results])
    print(f"Suppressed clues for this task: {suppressed or 'none'}")

    student_pair_best = {}
    for a, b, signals in raw_results:
        verdict = classify_pair(signals, suppressed)
        key = tuple(sorted((a["user_id"], b["user_id"])))
        current = student_pair_best.get(key)
        if current is None or verdict["score"] > current["verdict"]["score"]:
            student_pair_best[key] = {
                "verdict": verdict,
                "signals": signals,
                "images": [a["url"], b["url"]],
            }

    links = []
    for (student_a, student_b), best in student_pair_best.items():
        if best["verdict"]["link_type"] == "NONE":
            continue
        links.append(
            {
                "student_a": student_a,
                "student_b": student_b,
                "link_type": best["verdict"]["link_type"],
                "score": best["verdict"]["score"],
                "signals": best["signals"],
                "images": best["images"],
            }
        )
    links.sort(key=lambda l: -l["score"])

    groups = group_links(links)

    report = {
        "task_id": task_id,
        "students_submitted": len({img["user_id"] for img in images}),
        "pairs_compared": len(student_pair_best),
        "pairs_flagged": len(links),
        "suppressed_clues": suppressed,
        "links": links,
        "groups": [sorted(g) for g in groups],
    }

    OUTPUT_DIR.mkdir(exist_ok=True)
    out_path = OUTPUT_DIR / f"{task_id}_links.json"
    with out_path.open("w") as f:
        json.dump(report, f, indent=2, default=str)

    print(f"\n{len(links)} flagged pair(s) out of {len(student_pair_best)} compared.")
    print(f"Report written to {out_path}")


if __name__ == "__main__":
    main()
