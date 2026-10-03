"""Clue 7: upload timing, read straight from the S3 object's Last-Modified header.

Not Mongo's created_at/updated_at — the probe in ../README.md found the object
header can disagree with the Mongo write time.
"""

from datetime import datetime, timezone

import requests


def get_last_modified(url, timeout=10):
    """Returns a timezone-aware datetime, or None if the HEAD request fails."""
    try:
        resp = requests.head(url, timeout=timeout)
        resp.raise_for_status()
    except requests.RequestException:
        return None
    header = resp.headers.get("Last-Modified")
    if not header:
        return None
    try:
        return datetime.strptime(header, "%a, %d %b %Y %H:%M:%S %Z").replace(tzinfo=timezone.utc)
    except ValueError:
        return None


def seconds_apart(dt_a, dt_b):
    if dt_a is None or dt_b is None:
        return None
    return abs((dt_a - dt_b).total_seconds())
