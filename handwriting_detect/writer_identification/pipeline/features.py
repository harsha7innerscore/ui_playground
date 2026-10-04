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

# Hinge feature (Bulacu & Schomaker): how far along the contour each "leg" of
# the angle reaches, and how finely the angle pair is binned. 7px / 12 bins
# are the literature's usual starting point -- see commit for sources.
HINGE_LEG_PX = 7
HINGE_BINS = 12

# Resample every page so its pen stroke is this many pixels wide before the
# Hinge histogram is taken.
#
# Why: HINGE_LEG_PX is a distance in *pixels*, so on a page with 4px strokes a
# 7px leg reaches most of the way across a letter, while on a page with 15px
# strokes it barely leaves the stroke itself. Those are different measurements
# wearing the same name. Measured stroke width across our worksheets spans
# 4.01 to 15.23px -- nearly 4x -- and among pairs written by DIFFERENT people,
# the correlation between stroke-width difference and fingerprint distance is
# 0.428. That is the fingerprint reading pen and scan scale rather than the
# hand.
#
# It also explains part of the same-day confound: pages captured in one batch
# share a resolution and a pen, so they share a scale, so they look alike for
# a reason that has nothing to do with who held the pen.
#
# 7px is the median of the corpus, so the median page is left roughly
# untouched and only the outliers move.
TARGET_STROKE_PX = 7.0

# Bump when anything that changes a fingerprint's VALUE changes. fetch.py puts
# this in the cache path, so a stale vector computed by an older definition can
# never be silently mixed with a new one -- the failure mode would be invisible,
# since both are well-formed float vectors.
FEATURE_VERSION = 2


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


def hinge_histogram(mask, leg_px=HINGE_LEG_PX, bins=HINGE_BINS):
    """The Hinge feature (Bulacu & Schomaker, 2007) -- the field's standard
    answer to exactly the problem the gate found: per-letter shape stats
    (solidity, aspect ratio, per-component orientation -- what this function
    replaces) are tied to which letter it was, so two students writing the
    same short answer score as similar even when their handwriting is not.

    Method: walk every point along the ink's contour. At each point, look a
    fixed number of pixels back and forward along the *same* contour -- two
    "legs" hinged at that point -- and record the pair of directions they
    point in. Over an entire page this produces thousands of (angle, angle)
    pairs, one per contour point, binned into a joint histogram.

    Why this fixes the content problem: a single digit or short word
    contributes only a handful of points to a histogram built from thousands.
    What survives at that scale is the population statistic of how sharply
    this writer bends a stroke -- not the identity of any letter they used to
    produce it. Letter-level stats have no such averaging: a page with one
    answer has only as many components as there are letters, so one unusual
    letter shape (or one that happens to match another student's) can swing
    the whole fingerprint.

    phi1/phi2 are sorted (phi1 <= phi2) before binning: swapping which leg is
    "forward" describes the same hinge shape, so folding them together halves
    the histogram without losing information, per the standard formulation.

    Runs over cv2.RETR_LIST contours (not RETR_EXTERNAL, used by the stats
    this replaces) so the inner contour of a loop -- the hole in an "o" or
    "a" -- contributes its own hinge angles too; loop shape is exactly the
    kind of habit this feature is meant to capture.
    """
    contours, _ = cv2.findContours(mask, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
    bin_width = 360.0 / bins
    counts = np.zeros(bins * bins, dtype=np.int64)
    total = 0

    for c in contours:
        pts = c.reshape(-1, 2).astype(np.float64)
        n = len(pts)
        if n < 2 * leg_px + 1:
            continue
        idx = np.arange(n)
        back_vec = pts[(idx - leg_px) % n] - pts
        fwd_vec = pts[(idx + leg_px) % n] - pts
        angle_back = (np.degrees(np.arctan2(back_vec[:, 1], back_vec[:, 0])) + 360) % 360
        angle_fwd = (np.degrees(np.arctan2(fwd_vec[:, 1], fwd_vec[:, 0])) + 360) % 360
        phi1 = np.minimum(angle_back, angle_fwd)
        phi2 = np.maximum(angle_back, angle_fwd)
        b1 = np.clip((phi1 // bin_width).astype(np.int64), 0, bins - 1)
        b2 = np.clip((phi2 // bin_width).astype(np.int64), 0, bins - 1)
        counts += np.bincount(b1 * bins + b2, minlength=bins * bins)
        total += n

    if total == 0:
        return None
    return (counts / total).tolist()


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


def normalize_stroke_scale(gray, measured_stroke, target=TARGET_STROKE_PX):
    """Resample so the pen stroke is `target` pixels wide. Returns (gray, scale).

    Resamples the greyscale image and re-thresholds, rather than resizing the
    binary mask: scaling a mask quantizes stroke edges and would change exactly
    the contour micro-shape the Hinge feature reads.

    The scale factor is clamped. A page whose measured stroke is wildly off
    (a near-blank crop, a mask that latched onto page furniture) would
    otherwise be blown up or shrunk to the point where the resample itself
    invents the texture being measured.
    """
    if not measured_stroke or measured_stroke <= 0:
        return gray, 1.0
    scale = float(np.clip(target / measured_stroke, 0.25, 4.0))
    if abs(scale - 1.0) < 0.05:
        return gray, 1.0
    interpolation = cv2.INTER_AREA if scale < 1 else cv2.INTER_CUBIC
    resized = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=interpolation)
    return resized, scale


def extract_fingerprint(gray, normalize_scale=True):
    """gray -> dict of named features, or None if there isn't enough ink to
    say anything (see MIN_INK_PX in gate.py for the cutoff this feeds).

    The shape features are measured on a scale-normalized copy of the page (see
    TARGET_STROKE_PX) so that "how sharply this person bends a stroke" is not
    confounded with "how thick their pen was and how big the scan was". The
    raw, un-normalized stroke width is still reported as its own feature -- pen
    choice is a genuine writer habit, it just must not be smuggled into the
    shape histogram as well.
    """
    mask = ink_mask(gray)
    ink_px = int((mask > 0).sum())
    if ink_px < MIN_COMPONENT_AREA:
        return None

    stroke_mean, stroke_ridge = stroke_width(mask)

    scale = 1.0
    if normalize_scale:
        normalized_gray, scale = normalize_stroke_scale(gray, stroke_mean)
        if scale != 1.0:
            mask = ink_mask(normalized_gray)
            if int((mask > 0).sum()) < MIN_COMPONENT_AREA:
                return None

    hinge = hinge_histogram(mask)
    gap_mean, gap_std = horizontal_gaps(mask)
    density = ink_density(mask)

    if hinge is None:
        return None

    return {
        "ink_px": ink_px,
        "stroke_width_mean": stroke_mean,
        "stroke_width_ridge": stroke_ridge,
        "ink_density": density,
        # gaps are measured on the scale-normalized page, so a wide-spacing
        # habit is no longer indistinguishable from a higher-resolution scan
        "gap_mean": gap_mean,
        "gap_std": gap_std,
        "scale_applied": scale,
        "hinge_histogram": hinge,
    }


# Fixed order for turning a fingerprint dict into a vector. The hinge
# histogram bins are expanded individually (hinge_0_0 .. hinge_{B-1}_{B-1}).
# stroke width, ink density and gap stats are kept alongside the hinge
# histogram -- they describe pressure and spacing, not letter shape, so they
# carry their own content-light signal rather than competing with it.
SCALAR_FIELDS = [
    "stroke_width_mean",
    "stroke_width_ridge",
    "ink_density",
    "gap_mean",
    "gap_std",
]


def flatten(fingerprint):
    """dict -> fixed-length float vector, fixed field order, for distance math.
    None values become NaN so a caller can decide to drop or impute rather than
    silently treating a missing clue as zero.
    """
    values = [fingerprint.get(f) for f in SCALAR_FIELDS]
    values = [float(v) if v is not None else float("nan") for v in values]
    hinge_len = HINGE_BINS * HINGE_BINS
    values.extend(float(v) for v in fingerprint.get("hinge_histogram", [float("nan")] * hinge_len))
    return np.array(values, dtype=float)


FEATURE_NAMES = SCALAR_FIELDS + [
    f"hinge_{i}_{j}" for i in range(HINGE_BINS) for j in range(HINGE_BINS)
]
