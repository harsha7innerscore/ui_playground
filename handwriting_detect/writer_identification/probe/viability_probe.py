#!/usr/bin/env python3
"""Is there enough handwriting detail in these images to fingerprint a writer?

Usage:
    python3 viability_probe.py [--sample N]

Our images arrive through a PDF-rasterisation path at 96 DPI, which already
destroyed three of Problem 2's seven clues (camera geometry, encoder
fingerprint, most of lighting). Before building a handwriting fingerprint on
the same images, measure whether the letterform detail it depends on survived.

Three questions, per ../case1_identification.md:

1. Stroke width in pixels. Below ~4px there is no letterform shape left to
   measure, only compression noise. No model recovers this — the information
   is not in the file.
2. Ink quantity. A crop with three words has no stable fingerprint; we need a
   minimum-ink cutoff below which we decline to score.
3. Full pages vs answer crops. The crops have the worksheet's printed question
   text already excluded upstream, so they should be the cleaner input — but
   they are also much smaller, so they may fall below the resolution bar that
   full pages clear.

Reads the fetched history from ../../scripts/get_student_history/output/.
Downloads are cached in cache/ and never re-fetched.
"""

import argparse
import hashlib
import json
import random
import sys
from pathlib import Path

import cv2
import numpy as np
import requests

SCRIPT_DIR = Path(__file__).resolve().parent
CACHE_DIR = SCRIPT_DIR / "cache"
OUTPUT_DIR = SCRIPT_DIR / "output"
HISTORY_FILE = (
    SCRIPT_DIR.parent.parent
    / "scripts"
    / "get_student_history"
    / "output"
    / "student_history_pages.json"
)

# Below this, strokes are too thin for letterform shape to have survived.
MIN_STROKE_WIDTH_PX = 4.0
# Connected components smaller than this are speckle, not ink.
MIN_COMPONENT_AREA = 6


def fetch(url):
    """Download once, then serve from cache."""
    CACHE_DIR.mkdir(exist_ok=True)
    path = CACHE_DIR / hashlib.md5(url.encode()).hexdigest()
    if path.exists():
        return path.read_bytes()
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    path.write_bytes(response.content)
    return response.content


def ink_mask(gray):
    """Local-threshold ink/paper split, matching the Problem 2 pipeline, then
    drop speckle so stroke measurements aren't dominated by compression noise."""
    block = max(15, (min(gray.shape) // 20) | 1)
    mask = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, block, 10
    )
    count, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    cleaned = np.zeros_like(mask)
    for i in range(1, count):
        if stats[i, cv2.CC_STAT_AREA] >= MIN_COMPONENT_AREA:
            cleaned[labels == i] = 255
    return cleaned


def stroke_width(mask):
    """Two estimates of pen-line thickness in pixels, both from the distance
    transform, which gives each ink pixel its distance to the nearest paper.

    ridge: the centre of a stroke of width w sits w/2 from the edge, so twice a
    high percentile of the transform approximates w. Biased high at junctions
    and filled blobs.

    mean: across a stroke of width w the transform runs 0.5, 1.5 ... w/2, whose
    mean is about w/4, so four times the mean approximates w. Biased low where
    strokes are frayed by compression.

    Reporting both is the point. They bracket the true width, and if they
    disagree wildly the mask is noise rather than strokes.

    An earlier area/perimeter estimator was dropped: filled regions (printed
    text blocks, table rules, dark page edges) have far more area per unit
    perimeter than a pen line, which inflated it to ~10x the real width.
    """
    dist = cv2.distanceTransform(mask, cv2.DIST_L2, 5)
    ink = dist[mask > 0]
    if not ink.size:
        return None, None
    return float(4.0 * ink.mean()), float(2.0 * np.percentile(ink, 95))


def measure(url):
    gray = cv2.imdecode(np.frombuffer(fetch(url), np.uint8), cv2.IMREAD_GRAYSCALE)
    if gray is None:
        return None
    mask = ink_mask(gray)
    by_mean, by_ridge = stroke_width(mask)
    height, width = gray.shape
    return {
        "width": width,
        "height": height,
        "megapixels": round(width * height / 1e6, 2),
        "ink_pct": round(100.0 * (mask > 0).sum() / mask.size, 2),
        "ink_px": int((mask > 0).sum()),
        "stroke_width_mean": round(by_mean, 2) if by_mean else None,
        "stroke_width_ridge": round(by_ridge, 2) if by_ridge else None,
    }


def summarise(label, rows):
    if not rows:
        print(f"\n{label}: nothing measured")
        return None

    def column(name):
        return [r[name] for r in rows if r.get(name) is not None]

    stats = {}
    print(f"\n{label}  (n={len(rows)})")
    print(f"  {'metric':26} {'min':>9} {'median':>9} {'max':>9}")
    for name in (
        "width",
        "height",
        "megapixels",
        "ink_pct",
        "stroke_width_mean",
        "stroke_width_ridge",
    ):
        values = column(name)
        if not values:
            continue
        low, mid, high = min(values), float(np.median(values)), max(values)
        stats[name] = {"min": low, "median": round(mid, 2), "max": high}
        print(f"  {name:26} {low:>9.2f} {mid:>9.2f} {high:>9.2f}")

    widths = column("stroke_width_ridge")
    if widths:
        thin = sum(1 for w in widths if w < MIN_STROKE_WIDTH_PX)
        print(
            f"\n  below the {MIN_STROKE_WIDTH_PX}px bar: {thin}/{len(widths)} "
            f"({100.0 * thin / len(widths):.0f}%)"
        )
        stats["below_bar_pct"] = round(100.0 * thin / len(widths), 1)
    return stats


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--sample", type=int, default=30, help="images to measure per type (default 30)"
    )
    parser.add_argument("--seed", type=int, default=0)
    args = parser.parse_args()

    if not HISTORY_FILE.exists():
        print(f"History file not found: {HISTORY_FILE}", file=sys.stderr)
        print("Run scripts/get_student_history/fetch_student_history.py first.", file=sys.stderr)
        sys.exit(1)

    with HISTORY_FILE.open() as f:
        records = json.load(f)

    pages = [(r["user_id"], u) for r in records for u in r["page_image_urls"]]
    crops = [(r["user_id"], u) for r in records for u in r["answer_crop_urls"]]
    print(f"Available: {len(pages)} full pages, {len(crops)} answer crops")

    rng = random.Random(args.seed)
    results = {}
    for label, pool in (("Full pages", pages), ("Answer crops", crops)):
        chosen = rng.sample(pool, min(args.sample, len(pool)))
        rows = []
        for user_id, url in chosen:
            row = measure(url)
            if row:
                row["user_id"] = user_id
                row["url"] = url
                rows.append(row)
        results[label] = {"rows": rows, "summary": summarise(label, rows)}

    OUTPUT_DIR.mkdir(exist_ok=True)
    out_path = OUTPUT_DIR / "viability_probe.json"
    with out_path.open("w") as f:
        json.dump(results, f, indent=2)
    print(f"\nFull per-image measurements written to {out_path}")


if __name__ == "__main__":
    main()
