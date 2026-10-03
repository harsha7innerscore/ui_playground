#!/usr/bin/env python3
"""Fetch ocr-worksheet-details docs for a journey_id from ai-tutor (ops_mongo).

Usage:
    python fetch_journey_worksheets.py <journey_id>

Queries ai-tutor.ocr-worksheet-details for documents matching the given id
under either `journey_id` or `journeyId` (schema isn't confirmed yet), dumps
the raw docs to scripts/output/<journey_id>.json, and prints any s3 urls
found so they can be pulled for Problem 2 analysis.
"""

import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

DB_NAME = "ai-tutor"
COLLECTION_NAME = "ocr-worksheet-details"

SCRIPT_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = SCRIPT_DIR / "output"


def find_s3_urls(doc, path=""):
    """Recursively collect (path, value) pairs that look like s3 locations."""
    found = []
    if isinstance(doc, dict):
        for key, value in doc.items():
            key_path = f"{path}.{key}" if path else key
            if isinstance(value, str) and ("s3://" in value or "s3" in key.lower() or "url" in key.lower()):
                found.append((key_path, value))
            else:
                found.extend(find_s3_urls(value, key_path))
    elif isinstance(doc, list):
        for i, item in enumerate(doc):
            found.extend(find_s3_urls(item, f"{path}[{i}]"))
    return found


def main():
    if len(sys.argv) != 2:
        print("Usage: python fetch_journey_worksheets.py <journey_id>", file=sys.stderr)
        sys.exit(1)

    journey_id = sys.argv[1]

    load_dotenv(SCRIPT_DIR / ".env")
    mongo_url = os.environ.get("OPS_MONGO_URL")
    if not mongo_url:
        print("OPS_MONGO_URL not set. Copy .env.example to .env and fill it in.", file=sys.stderr)
        sys.exit(1)

    client = MongoClient(mongo_url)
    collection = client[DB_NAME][COLLECTION_NAME]

    query = {"$or": [{"journey_id": journey_id}, {"journeyId": journey_id}]}
    docs = list(collection.find(query))

    print(f"Matched {len(docs)} document(s) for journey_id={journey_id!r}")

    if not docs:
        client.close()
        return

    OUTPUT_DIR.mkdir(exist_ok=True)
    out_path = OUTPUT_DIR / f"{journey_id}.json"
    with out_path.open("w") as f:
        json.dump(docs, f, indent=2, default=str)
    print(f"Raw docs written to {out_path}")

    print("\nCandidate s3/url fields:")
    for i, doc in enumerate(docs):
        hits = find_s3_urls(doc)
        if not hits:
            continue
        print(f"\n  doc[{i}] (_id={doc.get('_id')}):")
        for key_path, value in hits:
            print(f"    {key_path} = {value}")

    client.close()


if __name__ == "__main__":
    main()
