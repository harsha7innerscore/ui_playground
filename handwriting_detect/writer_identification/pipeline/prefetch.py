#!/usr/bin/env python3
"""Fill the image + fingerprint caches in parallel, before the serial analyses.

main.py, diagnose_features.py, auc_check.py and signature_test.py all call
main.load_items(), which walks every page serially. That was fine at 319 pages.
At 8171 it is roughly four hours of mostly-idle waiting -- each page is a
network round trip followed by Hough/contour work on a ~5.7MP image.

Nothing about that work is order-dependent: each url is fetched and
fingerprinted independently and written to its own cache file, keyed by
md5(url). So this script does exactly what load_items() does per url, across a
pool, and then every downstream run finds a warm cache and costs no network at
all. It is purely an accelerator -- deleting it changes no result, only how
long the first run takes.

Processes, not threads: the download is I/O-bound but the fingerprint is
OpenCV/numpy CPU work on a large image, and that is the dominant cost.

Usage:
    python3 prefetch.py [--workers N] [--limit N]
"""

import argparse
import json
import sys
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

import main
from fetch import FEATURE_CACHE, _key


def already_cached(url):
    return (FEATURE_CACHE / f"{_key(url)}.json").exists()


def worker(url):
    """Returns (url, status). Mirrors main.fingerprint_url's caching contract
    exactly -- including writing {} for a page that yields no usable
    fingerprint, so a failed page is not retried on every later run.
    """
    try:
        fingerprint = main.fingerprint_url(url)
    except Exception as exc:  # noqa: BLE001 -- one bad page must not kill the pool
        return url, f"error: {exc}"
    return url, "ok" if fingerprint is not None else "skipped"


def collect_urls():
    history_path = main.HISTORY_FILE
    if not history_path.exists():
        print(f"History file not found: {history_path}", file=sys.stderr)
        sys.exit(1)
    with history_path.open() as f:
        history = json.load(f)

    urls = []
    seen = set()
    for docs in history.values():
        for doc in docs:
            for url in main.page_urls(doc):
                if url not in seen:
                    seen.add(url)
                    urls.append(url)
    return urls


def main_cli():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workers", type=int, default=8)
    parser.add_argument("--limit", type=int, default=None, help="cap urls, for a smoke test")
    args = parser.parse_args()

    urls = collect_urls()
    if args.limit:
        urls = urls[: args.limit]

    pending = [u for u in urls if not already_cached(u)]
    print(f"{len(urls)} pages total, {len(urls) - len(pending)} already cached, {len(pending)} to do")
    if not pending:
        return

    counts = {"ok": 0, "skipped": 0, "error": 0}
    done = 0
    with ProcessPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(worker, url): url for url in pending}
        for future in as_completed(futures):
            _, status = future.result()
            counts[status.split(":")[0] if status.startswith("error") else status] += 1
            done += 1
            if done % 200 == 0 or done == len(pending):
                print(f"  {done}/{len(pending)}  ok={counts['ok']} "
                      f"skipped={counts['skipped']} error={counts['error']}", flush=True)

    print(f"\nDone. ok={counts['ok']} skipped={counts['skipped']} error={counts['error']}")


if __name__ == "__main__":
    main_cli()
