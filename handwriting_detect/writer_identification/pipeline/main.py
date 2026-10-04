#!/usr/bin/env python3
"""Run the go/no-go gate for Problem 1 (writer identification).

Usage:
    python3 main.py [--limit-pages-per-worksheet N]

Reads the student-scoped history already fetched by
../../scripts/get_student_history/fetch_student_history.py, fingerprints every
page in image_urls (cached by url -> never recomputed across reruns, same as
Problem 2), then hands the per-page vectors to gate.py to build the four
comparison buckets and report whether fingerprints track the hand or the page.

Full pages only -- image_urls, not the answer_crops segmentation. Per
../probe/FINDINGS.md there is no printed worksheet text on these pages (plain
ruled notebook paper), so crops bought nothing by excluding text that was
never there, at the cost of more moving parts (segments parsing, far more,
much smaller images). Full pages are the simpler, direct input.
"""

import argparse
import json
import sys
from pathlib import Path

import numpy as np

import features
import gate
from fetch import fetch_bytes, load_cached_fingerprint, save_fingerprint

PIPELINE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = PIPELINE_DIR / "output"
HISTORY_FILE = (
    PIPELINE_DIR.parent.parent / "scripts" / "get_student_history" / "output" / "student_history.json"
)

# A page below this many ink pixels can't produce a stable fingerprint --
# per case1_identification.md's viability check, decline rather than guess.
MIN_INK_PX = 150


def content_key(doc):
    """Proxy for 'this is the same assigned worksheet' across students: same
    subject, same topic, same date. Verified against real data before writing
    this gate (see commit): on four of our dates this groups students into the
    small clusters who did one identical worksheet that day.
    """
    date = str(doc.get("created_at"))[:10]
    return f"{doc.get('subject_id')}:{doc.get('topic_name_id')}:{date}"


def page_urls(doc):
    return list(doc.get("image_urls") or [])


CACHE_ONLY = False


def fingerprint_url(url):
    cached = load_cached_fingerprint(url)
    if cached is not None:
        return cached if cached != {} else None  # {} marks a prior "no ink" result

    if CACHE_ONLY:
        # Analysis reruns must never silently turn into a download. A partially
        # filled cache (prefetch stopped early, say) would otherwise make every
        # evaluation re-fetch thousands of pages one at a time.
        return None

    try:
        raw = fetch_bytes(url)
        gray = features.decode_gray(raw)
        fp = features.extract_fingerprint(gray) if gray is not None else None
    except Exception as exc:  # noqa: BLE001 -- log and skip, one bad url shouldn't kill the run
        print(f"  ! failed on {url}: {exc}", file=sys.stderr)
        fp = None

    if fp is not None and fp["ink_px"] < MIN_INK_PX:
        fp = None

    save_fingerprint(url, fp if fp is not None else {})
    return fp


def load_items(limit_pages_per_worksheet=None, cache_only=False):
    """Fingerprint every page in image_urls across the fetched student history
    (cached by url, so a rerun with nothing new costs no network calls).
    Returns (items, total_pages, skipped_low_ink).
    """
    global CACHE_ONLY
    CACHE_ONLY = cache_only

    if not HISTORY_FILE.exists():
        print(f"History file not found: {HISTORY_FILE}", file=sys.stderr)
        print("Run scripts/get_student_history/fetch_student_history.py first.", file=sys.stderr)
        sys.exit(1)

    with HISTORY_FILE.open() as f:
        history_by_student = json.load(f)

    items = []
    skipped_low_ink = 0
    total_pages = 0

    for user_id, docs in history_by_student.items():
        for doc in docs:
            worksheet_id = doc.get("worksheet_id")
            key = content_key(doc)
            urls = page_urls(doc)
            if limit_pages_per_worksheet:
                urls = urls[:limit_pages_per_worksheet]

            for url in urls:
                total_pages += 1
                fp = fingerprint_url(url)
                if fp is None:
                    skipped_low_ink += 1
                    continue
                items.append(
                    {
                        "user_id": user_id,
                        "worksheet_id": worksheet_id,
                        "content_key": key,
                        "url": url,
                        "raw_vector": features.flatten(fp),
                    }
                )

    return items, total_pages, skipped_low_ink


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--limit-pages-per-worksheet",
        type=int,
        default=None,
        help="cap pages fingerprinted per worksheet, for a fast first pass",
    )
    args = parser.parse_args()

    items, total_pages, skipped_low_ink = load_items(args.limit_pages_per_worksheet)
    print(f"Fingerprinted {len(items)}/{total_pages} pages ({skipped_low_ink} below ink floor or unreadable)")

    if len(items) < 20:
        print("Too few usable pages to run the gate.", file=sys.stderr)
        sys.exit(1)

    report = {
        "pages_fingerprinted": len(items),
        "pages_total": total_pages,
        "pages_skipped_low_ink": skipped_low_ink,
    }

    # --- Page-level: one page vs one page, the noisiest unit. This is
    # Case 2's granularity -- no averaging, nothing to cancel per-page noise.
    page_items = [dict(item, vector=item["raw_vector"]) for item in items]
    page_vectors = gate.standardize([item["vector"] for item in page_items])
    for item, vec in zip(page_items, page_vectors):
        item["vector"] = vec
    page_summary, page_result, page_reason = run_gate("PAGE-LEVEL (Case 2 granularity)", page_items)
    report["page_level"] = {"bucket_summary": page_summary, "verdict": page_result, "reason": page_reason}

    # --- Worksheet-level: average a student's pages within one worksheet into
    # one vector first, same as Case 1's per-student signature step. If noise
    # is what sank the page-level gate, averaging should recover separation.
    by_worksheet = {}
    for item in items:
        by_worksheet.setdefault(item["worksheet_id"], []).append(item)

    worksheet_items = []
    for worksheet_id, group in by_worksheet.items():
        stacked = np.vstack([g["raw_vector"] for g in group])
        mean_vector = np.nanmean(stacked, axis=0)
        worksheet_items.append(
            {
                "user_id": group[0]["user_id"],
                "worksheet_id": worksheet_id,
                "content_key": group[0]["content_key"],
                "vector": mean_vector,
                "n_pages": len(group),
            }
        )

    ws_vectors = gate.standardize([item["vector"] for item in worksheet_items])
    for item, vec in zip(worksheet_items, ws_vectors):
        item["vector"] = vec

    ws_summary, ws_result, ws_reason = run_gate(
        "WORKSHEET-LEVEL (Case 1 granularity -- one averaged signature per worksheet)",
        worksheet_items,
    )
    print(
        f"  ({len(worksheet_items)} worksheets, same_sitting bucket is necessarily empty here --"
        " aggregation collapses each worksheet to one point)"
    )
    report["worksheet_level"] = {
        "worksheets": len(worksheet_items),
        "bucket_summary": ws_summary,
        "verdict": ws_result,
        "reason": ws_reason,
    }

    OUTPUT_DIR.mkdir(exist_ok=True)
    out_path = OUTPUT_DIR / "gate_report.json"
    with out_path.open("w") as f:
        json.dump(report, f, indent=2)
    print(f"\nFull report written to {out_path}")


def run_gate(label, items):
    buckets = gate.build_buckets(items)
    summary = gate.summarize(buckets)
    result, reason = gate.verdict(summary)

    print(f"\n=== {label} ===")
    print(f"  {'bucket':28} {'n':>6} {'min':>8} {'p25':>8} {'median':>8} {'p75':>8} {'max':>8}")
    for name in gate.BUCKET_ORDER:
        row = summary[name]
        if row["n"] == 0:
            print(f"  {name:28} {'0':>6}  (no pairs)")
            continue
        print(
            f"  {name:28} {row['n']:>6} {row['min']:>8} {row['p25']:>8} "
            f"{row['median']:>8} {row['p75']:>8} {row['max']:>8}"
        )
    print(f"  Verdict: {result} -- {reason}")
    return summary, result, reason


if __name__ == "__main__":
    main()
