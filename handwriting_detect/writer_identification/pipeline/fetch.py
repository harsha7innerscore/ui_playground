"""Download-once, cache-forever image fetch -- same pattern as Problem 2's
pipeline: extraction is the expensive part (network + pixels), so raw bytes
and the derived fingerprint are each cached by a hash of the url and never
recomputed across reruns.
"""

import hashlib
import json
from pathlib import Path

import requests

import features

PIPELINE_DIR = Path(__file__).resolve().parent
IMAGE_CACHE = PIPELINE_DIR / "cache" / "images"
# Versioned: a fingerprint computed under an older feature definition is still
# a well-formed float vector, so mixing one into a new run fails silently and
# looks like noise rather than an error. Images are NOT versioned -- the bytes
# at a url do not change, and re-downloading 2.6GB to change a feature would
# make iteration unaffordable.
FEATURE_CACHE = PIPELINE_DIR / "cache" / f"features_v{features.FEATURE_VERSION}"


def _key(url):
    return hashlib.md5(url.encode()).hexdigest()


def fetch_bytes(url, timeout=30):
    IMAGE_CACHE.mkdir(parents=True, exist_ok=True)
    path = IMAGE_CACHE / _key(url)
    if path.exists():
        return path.read_bytes()
    response = requests.get(url, timeout=timeout)
    response.raise_for_status()
    path.write_bytes(response.content)
    return response.content


def load_cached_fingerprint(url):
    FEATURE_CACHE.mkdir(parents=True, exist_ok=True)
    path = FEATURE_CACHE / f"{_key(url)}.json"
    if path.exists():
        with path.open() as f:
            return json.load(f)
    return None


def save_fingerprint(url, fingerprint):
    FEATURE_CACHE.mkdir(parents=True, exist_ok=True)
    path = FEATURE_CACHE / f"{_key(url)}.json"
    with path.open("w") as f:
        json.dump(fingerprint, f)
