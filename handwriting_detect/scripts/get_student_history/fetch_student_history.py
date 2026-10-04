#!/usr/bin/env python3
"""Fetch each student's most recent worksheets — the reference history Case 1 needs.

Usage:
    python3 fetch_student_history.py [--limit N] [--students <submissions.json>]

Where the sibling get_task_worksheets script is task-scoped (one task, every
student's single worksheet for it), this one is student-scoped: for each user_id
it pulls that student's last N worksheets across all tasks and dates.

Case 1 (writer identification) builds a per-student handwriting reference from
past work, so it needs several worksheets per student spread over several dates.
Pages from one worksheet share paper, scan settings and lighting, so a reference
built from a single sitting describes the sitting, not the student — hence the
distinct-date count in the coverage report.

Source: ops_mongo -> ai-tutor.ocr-worksheet-details, filtered by user_id, sorted
created_at descending.

Student ids default to the ones already pulled by get_task_worksheets.

Writes:
    output/student_history.json        raw worksheet docs, grouped by student
    output/student_history_pages.json  flat per-worksheet records (page images +
                                       answer crops), the shape Case 1 consumes
"""

import argparse
import json
import os
import sys
from collections import defaultdict
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

OPS_DB_NAME = "ai-tutor"
WORKSHEET_COLLECTION = "ocr-worksheet-details"

SCRIPT_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = SCRIPT_DIR / "output"
DEFAULT_STUDENTS_FILE = (
    SCRIPT_DIR.parent
    / "get_task_worksheets"
    / "output"
    / "6aa3d2192b1bf0252fe8ab41_submissions.json"
)

DEFAULT_LIMIT = 6


def load_student_ids(path):
    """Read distinct user_ids out of a get_task_worksheets submissions dump."""
    if not path.exists():
        print(f"Students file not found: {path}", file=sys.stderr)
        print("Run get_task_worksheets first, or pass --students.", file=sys.stderr)
        sys.exit(1)

    with path.open() as f:
        submissions = json.load(f)

    seen = []
    for sub in submissions:
        user_id = sub.get("user_id")
        if user_id and user_id not in seen:
            seen.append(user_id)
    return seen


def fetch_history(collection, user_id, limit):
    """That student's most recent worksheets, newest first."""
    return list(
        collection.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
    )


def answer_crop_urls(doc):
    """Per-answer handwriting crops, printed question text already excluded.

    Cleaner input for a handwriting fingerprint than the full page, which mixes
    the student's writing with the worksheet's printed text.
    """
    urls = []
    for segment in (doc.get("segments") or {}).values():
        for crop in segment.get("answer_crops") or []:
            url = crop.get("crop_image_url")
            if url:
                urls.append(url)
    return urls


def build_page_records(history_by_student):
    records = []
    for user_id, docs in history_by_student.items():
        for doc in docs:
            records.append(
                {
                    "user_id": user_id,
                    "worksheet_id": doc.get("worksheet_id"),
                    "journey_id": doc.get("journey_id"),
                    "created_at": str(doc.get("created_at")),
                    "num_pages": doc.get("num_pages"),
                    "page_image_urls": doc.get("image_urls", []),
                    "answer_crop_urls": answer_crop_urls(doc),
                }
            )
    return records


def date_of(doc):
    created_at = doc.get("created_at")
    return str(created_at)[:10] if created_at else None


def print_coverage(history_by_student):
    """Per-student worksheet and distinct-date counts.

    Distinct dates is the number that matters: Case 1's go/no-go gate compares
    same-student-different-date pages against different-student pages, and a
    student whose worksheets all land on one date cannot take part in it.
    """
    print("\nCoverage")
    print(f"  {'user_id':26} {'worksheets':>10} {'dates':>6} {'pages':>6} {'crops':>6}")

    usable = 0
    for user_id, docs in history_by_student.items():
        dates = {d for d in (date_of(doc) for doc in docs) if d}
        pages = sum(len(doc.get("image_urls") or []) for doc in docs)
        crops = sum(len(answer_crop_urls(doc)) for doc in docs)
        print(f"  {user_id:26} {len(docs):>10} {len(dates):>6} {pages:>6} {crops:>6}")
        if len(docs) >= 4 and len(dates) >= 3:
            usable += 1

    total = len(history_by_student)
    print(f"\n  {usable}/{total} students meet the gate bar (4+ worksheets, 3+ dates)")
    if usable < total:
        print("  Students below the bar can still be scored, but cannot validate the gate.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--limit",
        type=int,
        default=DEFAULT_LIMIT,
        help=f"most recent worksheets per student (default {DEFAULT_LIMIT})",
    )
    parser.add_argument(
        "--students",
        type=Path,
        default=DEFAULT_STUDENTS_FILE,
        help="get_task_worksheets submissions json to take user_ids from",
    )
    args = parser.parse_args()

    load_dotenv(SCRIPT_DIR / ".env")
    ops_mongo_url = os.environ.get("OPS_MONGO_URL")
    if not ops_mongo_url:
        print("OPS_MONGO_URL not set in .env", file=sys.stderr)
        sys.exit(1)

    student_ids = load_student_ids(args.students)
    print(f"Loaded {len(student_ids)} distinct student id(s) from {args.students}")

    ops_client = MongoClient(ops_mongo_url)
    worksheet_collection = ops_client[OPS_DB_NAME][WORKSHEET_COLLECTION]

    history_by_student = defaultdict(list)
    for user_id in student_ids:
        docs = fetch_history(worksheet_collection, user_id, args.limit)
        history_by_student[user_id] = docs
        dates = sorted({d for d in (date_of(doc) for doc in docs) if d})
        print(f"  {user_id} -> {len(docs)} worksheet(s), dates {dates}")

    ops_client.close()

    OUTPUT_DIR.mkdir(exist_ok=True)

    raw_path = OUTPUT_DIR / "student_history.json"
    with raw_path.open("w") as f:
        json.dump(dict(history_by_student), f, indent=2, default=str)
    print(f"\nRaw worksheet docs written to {raw_path}")

    records = build_page_records(history_by_student)
    pages_path = OUTPUT_DIR / "student_history_pages.json"
    with pages_path.open("w") as f:
        json.dump(records, f, indent=2, default=str)
    print(f"Flat page records written to {pages_path}")

    print_coverage(history_by_student)


if __name__ == "__main__":
    main()
