"""Pairwise comparison: turn two images' features into the six named signals
from ../README.md's output schema. Raw distances are kept alongside every
score — thresholds here are starting points, not calibrated (see README's
"measuring the false-positive rate instead of guessing").
"""

import math


def hamming(hash_a, hash_b):
    return sum(c1 != c2 for c1, c2 in zip(hash_a, hash_b))


def circular_diff_degrees(a, b, period=360.0):
    d = abs(a - b) % period
    return min(d, period - d)


def image_near_duplicate(feat_a, feat_b):
    distance = hamming(feat_a["dhash"], feat_b["dhash"])
    score = max(0.0, 100.0 * (1 - distance / 64))
    return {"fired": distance < 6, "distance": distance, "score": round(score, 1)}


def _match_points(points_a, points_b, pos_tolerance, extra_key=None, extra_tolerance=None):
    """Greedy nearest-neighbour match between two lists of {'x','y',...} points.
    Returns the fraction of the smaller list that found a close match in the other.
    """
    if not points_a or not points_b:
        return 0.0
    used_b = set()
    matched = 0
    for pa in points_a:
        best_j, best_d = None, None
        for j, pb in enumerate(points_b):
            if j in used_b:
                continue
            d = math.hypot(pa["x"] - pb["x"], pa["y"] - pb["y"])
            if extra_key is not None:
                extra_d = abs(pa[extra_key] - pb[extra_key])
                if extra_d > extra_tolerance:
                    continue
            if d <= pos_tolerance and (best_d is None or d < best_d):
                best_j, best_d = j, d
        if best_j is not None:
            used_b.add(best_j)
            matched += 1
    return matched / min(len(points_a), len(points_b))


def paper_match(feat_a, feat_b):
    details = {}

    fold_a = [{"x": off, "y": off, "angle": ang} for ang, off in feat_a.get("fold_lines") or []]
    fold_b = [{"x": off, "y": off, "angle": ang} for ang, off in feat_b.get("fold_lines") or []]
    fold_score = 100.0 * _match_points(fold_a, fold_b, pos_tolerance=0.03, extra_key="angle", extra_tolerance=3.0)
    details["fold_match_pct"] = round(fold_score, 1)

    stains_a, stains_b = feat_a.get("stain_blobs") or [], feat_b.get("stain_blobs") or []
    stain_score = 100.0 * _match_points(stains_a, stains_b, pos_tolerance=0.04)
    details["stain_match_pct"] = round(stain_score, 1)

    pitch_a, pitch_b = feat_a.get("ruling_pitch_px"), feat_b.get("ruling_pitch_px")
    if pitch_a and pitch_b:
        pitch_score = max(0.0, 100.0 * (1 - abs(pitch_a - pitch_b) / max(pitch_a, pitch_b)))
    else:
        pitch_score = None
    details["ruling_pitch_score"] = pitch_score

    colour_a, colour_b = feat_a.get("paper_colour_bgr"), feat_b.get("paper_colour_bgr")
    if colour_a and colour_b:
        dist = math.dist(colour_a, colour_b)
        colour_score = max(0.0, 100.0 * (1 - dist / 441.7))  # 441.7 = max possible BGR distance
    else:
        colour_score = None
    details["paper_colour_score"] = colour_score

    # High-information clues (fold, stain) drive the composite; low-information
    # clues (pitch, colour) only nudge it — per README's "do not average them".
    weighted = 0.6 * fold_score + 0.4 * stain_score
    low_info = [s for s in (pitch_score, colour_score) if s is not None]
    if low_info:
        weighted = 0.85 * weighted + 0.15 * (sum(low_info) / len(low_info))

    return {"fired": weighted > 60, "score": round(weighted, 1), "detail": details}


def lighting_match(feat_a, feat_b):
    light_a, light_b = feat_a.get("lighting"), feat_b.get("lighting")
    if not light_a or not light_b:
        return {"fired": False, "score": None, "detail": "insufficient paper area to fit a lighting plane"}
    dir_diff = circular_diff_degrees(light_a["direction_degrees"], light_b["direction_degrees"])
    steep_a, steep_b = light_a["steepness"], light_b["steepness"]
    steep_diff = abs(steep_a - steep_b)
    dir_score = max(0.0, 100.0 * (1 - dir_diff / 180))
    steep_score = max(0.0, 100.0 * (1 - steep_diff / max(steep_a, steep_b, 1e-6)))
    score = 0.7 * dir_score + 0.3 * steep_score
    flat_both = steep_a < 1.0 and steep_b < 1.0
    return {
        "fired": score > 70 and not flat_both,
        "score": round(score, 1),
        "detail": {
            "direction_diff_degrees": round(dir_diff, 1),
            "steepness_a": round(steep_a, 3),
            "steepness_b": round(steep_b, 3),
            "flat_lighting_both": flat_both,
        },
    }


def camera_geometry(feat_a, feat_b):
    d_a, d_b = feat_a.get("page_quad_distortion"), feat_b.get("page_quad_distortion")
    if d_a is None or d_b is None:
        return {"fired": False, "score": None, "detail": "page corners not found in one or both images"}
    diff = abs(d_a - d_b)
    score = max(0.0, 100.0 * (1 - diff / 0.5))
    return {"fired": score > 70, "score": round(score, 1), "detail": {"distortion_a": d_a, "distortion_b": d_b}}


def encoder_fingerprint(feat_a, feat_b):
    fp_a, fp_b = feat_a.get("jpeg_quant_fingerprint"), feat_b.get("jpeg_quant_fingerprint")
    if fp_a is None or fp_b is None:
        return {"fired": False, "score": None, "detail": "no quantisation table read from one or both files"}
    match = fp_a == fp_b
    return {"fired": match, "score": 100.0 if match else 0.0, "detail": {"fingerprint_a": fp_a, "fingerprint_b": fp_b}}


def upload_proximity(seconds):
    if seconds is None:
        return {"fired": False, "score": None, "detail": "timestamp unavailable for one or both uploads"}
    # 100 at 0s apart, ~50 at 10min, ~0 by a few hours
    score = 100.0 * math.exp(-seconds / 600.0)
    return {"fired": seconds < 300, "score": round(score, 1), "detail": {"seconds_apart": seconds}}


def score_pair(feat_a, feat_b, seconds_apart):
    return {
        "image_near_duplicate": image_near_duplicate(feat_a, feat_b),
        "paper_match": paper_match(feat_a, feat_b),
        "lighting_match": lighting_match(feat_a, feat_b),
        "camera_geometry": camera_geometry(feat_a, feat_b),
        "encoder_fingerprint": encoder_fingerprint(feat_a, feat_b),
        "upload_proximity": upload_proximity(seconds_apart),
    }
