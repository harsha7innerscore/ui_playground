"""Per-image feature extraction for Problem 2 (submission linking).

One function per clue from ../README.md. Every function takes the raw image
and returns plain numbers/strings so two images can be compared by simple
subtraction later (see scoring.py). Nothing here looks at handwriting itself.
"""

import hashlib

import cv2
import numpy as np


def decode_image(raw_bytes):
    arr = np.frombuffer(raw_bytes, dtype=np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)


# --- Clue 1: near-duplicate hash -------------------------------------------------

def dhash(gray, size=8):
    """8x8 average hash. Returns a 64-char '0'/'1' string."""
    small = cv2.resize(gray, (size, size), interpolation=cv2.INTER_AREA)
    avg = small.mean()
    bits = (small > avg).flatten()
    return "".join("1" if b else "0" for b in bits)


# --- Clue 2: ink / paper separation -----------------------------------------------

def ink_paper_masks(gray):
    """Local-threshold split. Returns (ink_mask, paper_mask), both bool arrays."""
    block = max(15, (min(gray.shape) // 20) | 1)  # odd, scales with image size
    ink_mask = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, block, 10
    ).astype(bool)
    paper_mask = ~ink_mask
    return ink_mask, paper_mask


# --- Clue 3: the paper itself ------------------------------------------------------

def ruling_pitch(gray):
    """Row-wise darkness profile -> dominant repeat spacing in pixels, via autocorrelation.

    Returns None if no clear periodicity (unruled paper, or too much ink noise).
    """
    row_darkness = 255.0 - gray.mean(axis=1)
    row_darkness -= row_darkness.mean()
    if row_darkness.std() < 1e-6:
        return None
    autocorr = np.correlate(row_darkness, row_darkness, mode="full")
    autocorr = autocorr[len(autocorr) // 2 :]
    # first local max after lag 0, ignoring the first few pixels (noise)
    min_lag = 10
    search = autocorr[min_lag:len(autocorr) // 2]
    if len(search) < 2:
        return None
    peak_lag = int(np.argmax(search)) + min_lag
    if autocorr[peak_lag] <= 0:
        return None
    return float(peak_lag)


def paper_colour(img_bgr, paper_mask):
    if paper_mask.sum() == 0:
        return None
    pixels = img_bgr[paper_mask]
    return [float(x) for x in pixels.mean(axis=0)]  # BGR


def fold_lines(gray):
    """Long, near-straight lines spanning most of the page -> candidate folds/creases.

    Returns a list of (angle_degrees, offset_fraction) — offset as a fraction of the
    perpendicular image dimension, so position is comparable across different image sizes.
    """
    edges = cv2.Canny(gray, 40, 120)
    h, w = gray.shape
    min_len = int(0.6 * min(h, w))
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=150, minLineLength=min_len, maxLineGap=10)
    results = []
    if lines is None:
        return results
    for line in lines[:20]:  # cap for cost; longest lines come first from Hough in practice
        x1, y1, x2, y2 = np.ravel(line)
        angle = float(np.degrees(np.arctan2(y2 - y1, x2 - x1)))
        offset = float(((x1 + x2) / 2) / w if abs(angle) > 45 else ((y1 + y2) / 2) / h)
        results.append((angle, offset))
    return results


def stain_blobs(img_bgr, paper_mask):
    """Colour/brightness outliers inside the paper area -> candidate stains/marks."""
    if paper_mask.sum() < 100:
        return []
    paper_pixels = img_bgr[paper_mask].astype(np.float32)
    median_colour = np.median(paper_pixels, axis=0)
    diff = np.linalg.norm(img_bgr.astype(np.float32) - median_colour, axis=2)
    outlier_mask = (diff > 40) & paper_mask
    outlier_mask = outlier_mask.astype(np.uint8)
    n_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(outlier_mask, connectivity=8)
    h, w = paper_mask.shape
    blobs = []
    for i in range(1, n_labels):  # 0 is background
        area = stats[i, cv2.CC_STAT_AREA]
        if 30 < area < 0.05 * h * w:  # drop speckle noise and drop near-whole-page blobs
            cx, cy = centroids[i]
            blobs.append({"x": float(cx / w), "y": float(cy / h), "area": int(area)})
    blobs.sort(key=lambda b: -b["area"])
    return blobs[:10]


# --- Clue 4: lighting ---------------------------------------------------------------

def lighting_plane(gray, paper_mask):
    """Fit brightness(x, y) = a*x + b*y + c over the paper area.

    Returns (direction_degrees, steepness) or None if too little paper area to fit.
    """
    ys, xs = np.nonzero(paper_mask)
    if len(xs) < 500:
        return None
    h, w = gray.shape
    xs_n = xs / w
    ys_n = ys / h
    brightness = gray[ys, xs].astype(np.float64)
    A = np.column_stack([xs_n, ys_n, np.ones_like(xs_n)])
    (a, b, _c), *_ = np.linalg.lstsq(A, brightness, rcond=None)
    direction = float(np.degrees(np.arctan2(b, a)))
    steepness = float(np.hypot(a, b))
    return {"direction_degrees": direction, "steepness": steepness}


# --- Clue 5: camera / page geometry --------------------------------------------------

def page_quad_distortion(gray):
    """Find the page's bounding quadrilateral and measure how far it is from a
    perfect rectangle. If the page fills the frame (auto-cropped upload), this
    collapses to ~0 for every image — that collapse is itself the finding.
    """
    edges = cv2.Canny(gray, 30, 100)
    contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None
    largest = max(contours, key=cv2.contourArea)
    peri = cv2.arcLength(largest, True)
    approx = cv2.approxPolyDP(largest, 0.02 * peri, True)
    if len(approx) != 4:
        return None
    pts = approx.reshape(4, 2).astype(np.float64)
    side_lengths = [np.linalg.norm(pts[i] - pts[(i + 1) % 4]) for i in range(4)]
    # a perfect rectangle has opposite sides equal; measure relative deviation
    opp_diff = abs(side_lengths[0] - side_lengths[2]) / max(side_lengths[0], side_lengths[2], 1)
    opp_diff += abs(side_lengths[1] - side_lengths[3]) / max(side_lengths[1], side_lengths[3], 1)
    return float(opp_diff)


# --- Clue 6: JPEG encoder fingerprint -------------------------------------------------

def jpeg_quant_fingerprint(raw_bytes):
    """Hash of the DQT (quantisation table) segments straight from the JPEG header."""
    if raw_bytes[:2] != b"\xff\xd8":
        return None
    i = 2
    tables = []
    while i < len(raw_bytes) - 1:
        if raw_bytes[i] != 0xFF:
            i += 1
            continue
        marker = raw_bytes[i + 1]
        if marker in (0xD8, 0xD9, 0x01) or 0xD0 <= marker <= 0xD7:
            i += 2
            continue
        if marker == 0xDA:
            break
        length = (raw_bytes[i + 2] << 8) + raw_bytes[i + 3]
        seg = raw_bytes[i + 4 : i + 2 + length]
        if marker == 0xDB:
            tables.append(seg)
        i += 2 + length
    if not tables:
        return None
    return hashlib.md5(b"".join(tables)).hexdigest()


# --- Orchestration ---------------------------------------------------------------------

def extract_features(raw_bytes):
    img = decode_image(raw_bytes)
    if img is None:
        return {"decode_error": True}
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    ink_mask, paper_mask = ink_paper_masks(gray)
    return {
        "dhash": dhash(gray),
        "ruling_pitch_px": ruling_pitch(gray),
        "paper_colour_bgr": paper_colour(img, paper_mask),
        "fold_lines": fold_lines(gray),
        "stain_blobs": stain_blobs(img, paper_mask),
        "lighting": lighting_plane(gray, paper_mask),
        "page_quad_distortion": page_quad_distortion(gray),
        "jpeg_quant_fingerprint": jpeg_quant_fingerprint(raw_bytes),
        "image_shape": list(gray.shape),
    }
