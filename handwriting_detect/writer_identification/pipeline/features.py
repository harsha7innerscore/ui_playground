"""Per-image handwriting fingerprint extraction (Case 1 & Case 2, shared).

One function, extract_fingerprint(gray), turns an ink crop into a dict of named
scalar features describing *how* it was written -- slant, stroke width,
roundness, spacing, how often the pen lifts -- never what it says. Two crops by
the same writer should produce similar numbers; two different writers should
not.

Each feature is named and kept separate (not pre-combined into one opaque
vector) so a flagged match can say *which* aspects agreed, same spirit as
Problem 2's signals. flatten() turns the dict into the fixed-order vector the
gate and scoring need for distance math.

No ML, no training. Every function here is a plain statistic over pixels
already segmented into ink vs background -- the same kind of arithmetic
Problem 2 uses for paper/lighting/camera, pointed at the ink instead.
"""

import cv2
import numpy as np

# Below this, a component is compression speckle, not a stroke or letter part.
MIN_COMPONENT_AREA = 6

# Orientation histogram bins, degrees, covering a half-circle (orientation has
# no direction, a stroke tilted +30 deg looks the same rotated 180).
SLANT_BINS = 18


def decode_gray(raw_bytes):
    arr = np.frombuffer(raw_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_GRAYSCALE)
    return img


def _remove_ruled_lines(mask):
    """Drop long, near-horizontal lines -- notebook ruling and the red margin
    rule -- using HoughLinesP, which tolerates the small pixel-level gaps a
    real scanned ruling line has (anti-aliasing, JPEG blocking). A plain
    morphological opening with a width-scaled kernel was tried first and
    silently did nothing: erosion requires one unbroken run of ink as long as
    the kernel, and a ruled line broken into even a handful of sub-kernel
    fragments has no such run anywhere, so the opening finds nothing to
    remove and the line passes straight into the ink mask untouched. Confirmed
    on a real crop (see commit) where ruled lines were clearly still present
    in the output mask.

    This matters more than it sounds: every student's notebook carries the
    same ruling, so a leaked ruling line is a shared, non-discriminative
    signal injected into every fingerprint. It also biases the slant/
    orientation histogram toward horizontal regardless of who wrote the page.
    """
    height, width = mask.shape
    min_length = max(int(0.5 * width), 20)
    lines = cv2.HoughLinesP(
        mask, 1, np.pi / 180, threshold=80, minLineLength=min_length, maxLineGap=30
    )
    if lines is None:
        return mask

    cleaned = mask.copy()
    for x1, y1, x2, y2 in lines.reshape(-1, 4):
        angle = np.degrees(np.arctan2(y2 - y1, x2 - x1))
        if abs(angle) < 5 or abs(abs(angle) - 180) < 5:
            cv2.line(cleaned, (x1, y1), (x2, y2), 0, thickness=5)
    return cleaned


def ink_mask(gray):
    """Ink/paper split, tightened against two contaminants the viability probe
    found (../probe/FINDINGS.md): ruled lines and reverse-side bleed-through.

    Two thresholds, ANDed:
      - adaptive (local): same as Problem 2's ink_paper_masks, survives
        uneven lighting across the page.
      - Otsu (global): a single page-wide dark/light cut. Bleed-through is
        real ink, just on the wrong side of the sheet, so it reads as a
        lighter grey than the pen on this side -- the global cut drops it
        while the adaptive one alone would not.

    Then:
      - ruled lines removed by morphological opening with a long horizontal
        kernel -- a pen stroke is a few pixels wide and rarely runs further
        than a letter or two, a ruling line runs most of the crop width.
      - small speckle dropped by connected-component area.
    """
    block = max(15, (min(gray.shape) // 20) | 1)
    adaptive = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, block, 10
    )
    _, otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    mask = cv2.bitwise_and(adaptive, otsu)
    mask = _remove_ruled_lines(mask)

    count, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    cleaned = np.zeros_like(mask)
    for i in range(1, count):
        if stats[i, cv2.CC_STAT_AREA] >= MIN_COMPONENT_AREA:
            cleaned[labels == i] = 255
    return cleaned


def stroke_width(mask):
    """Two distance-transform estimates of pen-line thickness, in pixels.
    See ../probe/viability_probe.py for the derivation of both formulas and
    why an area/perimeter estimator was dropped (inflated by filled blobs).
    """
    dist = cv2.distanceTransform(mask, cv2.DIST_L2, 5)
    ink = dist[mask > 0]
    if not ink.size:
        return None, None
    return float(4.0 * ink.mean()), float(2.0 * np.percentile(ink, 95))


def component_stats(mask):
    """Per connected-component shape stats, each weighted by the component's
    own ink area so a handful of large letters don't get drowned out by many
    small speckle-sized fragments, and vice versa.

    Returns a dict of area-weighted mean/std across components:
      - orientation: angle of the component's major axis (cv2.fitEllipse),
        degrees, folded into 0-180 (orientation has no direction) -> feeds the
        slant histogram.
      - solidity: ink area / convex-hull area. Round, looping letters fill
        their hull; angular print-style letters leave gaps. Low = angular,
        high = round.
      - aspect_ratio: bounding-box height/width. Tall narrow strokes vs wide
        flat ones.
      - rel_area: component area relative to the whole ink bounding box, i.e.
        letter size relative to this writer's overall scale.
    """
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    xs, ys, ws, hs = [], [], [], []
    orientations, solidities, aspect_ratios, areas = [], [], [], []

    for c in contours:
        area = cv2.contourArea(c)
        if area < MIN_COMPONENT_AREA:
            continue
        x, y, w, h = cv2.boundingRect(c)
        xs.append(x)
        ys.append(y)
        ws.append(w)
        hs.append(h)
        areas.append(area)

        hull = cv2.convexHull(c)
        hull_area = cv2.contourArea(hull)
        solidities.append(area / hull_area if hull_area > 0 else 0.0)
        aspect_ratios.append(h / w if w > 0 else 0.0)

        if len(c) >= 5:
            (_, _), (_, _), angle = cv2.fitEllipse(c)
            orientations.append(angle % 180.0)

    if not areas:
        return None

    areas = np.array(areas, dtype=float)
    weights = areas / areas.sum()

    def weighted(values):
        values = np.array(values, dtype=float)
        mean = float(np.average(values, weights=weights[: len(values)]))
        var = float(np.average((values - mean) ** 2, weights=weights[: len(values)]))
        return mean, float(np.sqrt(var))

    ink_bbox_area = (max(xs) + max(ws) - min(xs)) * (max(ys) + max(hs) - min(ys)) if xs else 1
    rel_areas = areas / max(ink_bbox_area, 1)

    solidity_mean, solidity_std = weighted(solidities)
    aspect_mean, aspect_std = weighted(aspect_ratios)
    rel_area_mean, rel_area_std = weighted(rel_areas)

    orientation_hist = None
    if orientations:
        hist, _ = np.histogram(orientations, bins=SLANT_BINS, range=(0, 180))
        orientation_hist = (hist / hist.sum()).tolist() if hist.sum() > 0 else [0.0] * SLANT_BINS

    return {
        "num_components": len(areas),
        "solidity_mean": solidity_mean,
        "solidity_std": solidity_std,
        "aspect_ratio_mean": aspect_mean,
        "aspect_ratio_std": aspect_std,
        "rel_area_mean": rel_area_mean,
        "rel_area_std": rel_area_std,
        "orientation_hist": orientation_hist or [0.0] * SLANT_BINS,
    }


def horizontal_gaps(mask):
    """White-run lengths between ink within rows that contain ink -- spacing
    between letters and words, independent of overall image width (gaps are
    measured, not positions).
    """
    gaps = []
    for row in mask:
        ink_cols = np.where(row > 0)[0]
        if ink_cols.size < 2:
            continue
        runs = np.diff(ink_cols) - 1
        gaps.extend(int(r) for r in runs if r > 0)
    if not gaps:
        return None, None
    gaps = np.array(gaps, dtype=float)
    return float(gaps.mean()), float(gaps.std())


def ink_density(mask):
    """Ink pixels as a fraction of the writing's own bounding box, not the
    whole crop -- crops vary a lot in how much margin surrounds the answer,
    whole-image ink_pct (used in the viability probe) conflates that margin
    with how densely the person writes.
    """
    ys, xs = np.where(mask > 0)
    if ys.size == 0:
        return None
    bbox_area = (ys.max() - ys.min() + 1) * (xs.max() - xs.min() + 1)
    return float(ys.size / max(bbox_area, 1))


def extract_fingerprint(gray):
    """gray -> dict of named features, or None if there isn't enough ink to
    say anything (see MIN_INK_PX in gate.py for the cutoff this feeds).
    """
    mask = ink_mask(gray)
    ink_px = int((mask > 0).sum())
    if ink_px < MIN_COMPONENT_AREA:
        return None

    stroke_mean, stroke_ridge = stroke_width(mask)
    comp = component_stats(mask)
    gap_mean, gap_std = horizontal_gaps(mask)
    density = ink_density(mask)

    if comp is None:
        return None

    return {
        "ink_px": ink_px,
        "stroke_width_mean": stroke_mean,
        "stroke_width_ridge": stroke_ridge,
        "ink_density": density,
        "gap_mean": gap_mean,
        "gap_std": gap_std,
        **comp,
    }


# Fixed order for turning a fingerprint dict into a vector. Histogram bins are
# expanded individually (orientation_hist_0 .. orientation_hist_{N-1}).
SCALAR_FIELDS = [
    "stroke_width_mean",
    "stroke_width_ridge",
    "ink_density",
    "gap_mean",
    "gap_std",
    "solidity_mean",
    "solidity_std",
    "aspect_ratio_mean",
    "aspect_ratio_std",
    "rel_area_mean",
    "rel_area_std",
]


def flatten(fingerprint):
    """dict -> fixed-length float vector, fixed field order, for distance math.
    None values become NaN so a caller can decide to drop or impute rather than
    silently treating a missing clue as zero.
    """
    values = [fingerprint.get(f) for f in SCALAR_FIELDS]
    values = [float(v) if v is not None else float("nan") for v in values]
    values.extend(float(v) for v in fingerprint.get("orientation_hist", [float("nan")] * SLANT_BINS))
    return np.array(values, dtype=float)


FEATURE_NAMES = SCALAR_FIELDS + [f"orientation_hist_{i}" for i in range(SLANT_BINS)]
