#!/usr/bin/env python3
"""Fetch all worksheets for a task_id, chaining app_mongo -> ops_mongo.

Usage:
    python3 fetch_task_worksheets.py <task_id>

Step 1 (app_mongo): schoolai.taskprogresses filtered by task_id/taskId gives
one document per student who has progress on that task. Each carries a
journey_id.
Step 2 (ops_mongo): for every journey_id found, ai-tutor.ocr-worksheet-details
filtered by journey_id/journeyId gives the actual worksheet + image urls.

Dumps everything to output/<task_id>.json for Problem 2 (submission linking)
analysis, scoped to one task as goal.md requires. Also writes
output/<task_id>_submissions.json: a flat [{user_id, image_urls, ...}] list,
the direct input shape Problem 2's pairwise comparison needs.
"""

import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

APP_DB_NAME = "schoolai"
TASK_PROGRESS_COLLECTION = "taskprogresses"

OPS_DB_NAME = "ai-tutor"
WORKSHEET_COLLECTION = "ocr-worksheet-details"

SCRIPT_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = SCRIPT_DIR / "output"


def find_values_by_key(doc, key_substring, path=""):
    """Recursively collect values whose key contains key_substring (case-insensitive)."""
    found = []
    if isinstance(doc, dict):
        for key, value in doc.items():
            key_path = f"{path}.{key}" if path else key
            if key_substring.lower() in key.lower() and isinstance(value, (str, int)):
                found.append((key_path, value))
            else:
                found.extend(find_values_by_key(value, key_substring, key_path))
    elif isinstance(doc, list):
        for i, item in enumerate(doc):
            found.extend(find_values_by_key(item, key_substring, f"{path}[{i}]"))
    return found


def build_submissions(worksheets_by_journey):
    """Flatten worksheet docs into one {user_id, image_urls, ...} record per worksheet."""
    submissions = []
    for journey_id, docs in worksheets_by_journey.items():
        for doc in docs:
            submissions.append(
                {
                    "user_id": doc.get("user_id"),
                    "journey_id": journey_id,
                    "worksheet_id": doc.get("worksheet_id"),
                    "image_urls": doc.get("image_urls", []),
                }
            )
    return submissions


def main():
    if len(sys.argv) != 2:
        print("Usage: python3 fetch_task_worksheets.py <task_id>", file=sys.stderr)
        sys.exit(1)

    task_id = sys.argv[1]

    load_dotenv(SCRIPT_DIR / ".env")
    app_mongo_url = os.environ.get("APP_MONGO_URL")
    ops_mongo_url = os.environ.get("OPS_MONGO_URL")
    if not app_mongo_url or not ops_mongo_url:
        print("APP_MONGO_URL and/or OPS_MONGO_URL not set in .env", file=sys.stderr)
        sys.exit(1)

    app_client = MongoClient(app_mongo_url)
    task_progress_collection = app_client[APP_DB_NAME][TASK_PROGRESS_COLLECTION]

    task_query = {"$or": [{"task_id": task_id}, {"taskId": task_id}]}
    task_progress_docs = list(task_progress_collection.find(task_query))
    print(f"Matched {len(task_progress_docs)} taskprogresses document(s) for task_id={task_id!r}")

    journey_ids = set()
    for doc in task_progress_docs:
        for _, value in find_values_by_key(doc, "journey"):
            journey_ids.add(str(value))

    print(f"Found {len(journey_ids)} distinct journey_id(s): {sorted(journey_ids)}")

    app_client.close()

    worksheets_by_journey = {}
    if journey_ids:
        ops_client = MongoClient(ops_mongo_url)
        worksheet_collection = ops_client[OPS_DB_NAME][WORKSHEET_COLLECTION]

        for journey_id in journey_ids:
            worksheet_query = {"$or": [{"journey_id": journey_id}, {"journeyId": journey_id}]}
            docs = list(worksheet_collection.find(worksheet_query))
            worksheets_by_journey[journey_id] = docs
            print(f"  journey_id={journey_id!r} -> {len(docs)} worksheet doc(s)")

        ops_client.close()

    OUTPUT_DIR.mkdir(exist_ok=True)
    out_path = OUTPUT_DIR / f"{task_id}.json"
    with out_path.open("w") as f:
        json.dump(
            {
                "task_id": task_id,
                "task_progress_docs": task_progress_docs,
                "worksheets_by_journey": worksheets_by_journey,
            },
            f,
            indent=2,
            default=str,
        )
    print(f"\nRaw data written to {out_path}")

    submissions = build_submissions(worksheets_by_journey)
    submissions_path = OUTPUT_DIR / f"{task_id}_submissions.json"
    with submissions_path.open("w") as f:
        json.dump(submissions, f, indent=2, default=str)
    print(f"Submissions (user_id -> image_urls) written to {submissions_path}")

    print("\nuser_id -> image_urls:")
    for sub in submissions:
        for url in sub["image_urls"]:
            print(f"  {sub['user_id']}  {url}")


if __name__ == "__main__":
    main()
