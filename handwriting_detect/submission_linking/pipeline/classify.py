"""Combine the six signals into one score and a link_type — rules, not an
average, per ../README.md's "Combining the clues into a score".
"""


def usable(signals, suppressed, name):
    return name not in suppressed and signals[name]["score"] is not None


def classify_pair(signals, suppressed, suppressed_paper_subclues=()):
    dup = signals["image_near_duplicate"]
    if dup["fired"]:
        return {"link_type": "SAME_IMAGE", "score": round(dup["score"], 1)}

    paper = signals["paper_match"]["detail"]
    strong_paper = (
        paper["fold_match_pct"] > 60 and "fold_match_pct" not in suppressed_paper_subclues
    ) or (
        paper["stain_match_pct"] > 60 and "stain_match_pct" not in suppressed_paper_subclues
    )
    weak_paper_candidates = [
        paper[name]
        for name in ("ruling_pitch_score", "paper_colour_score")
        if name not in suppressed_paper_subclues
    ]
    weak_paper_only = not strong_paper and any(v is not None and v > 70 for v in weak_paper_candidates)

    session_clues = [
        n for n in ("lighting_match", "camera_geometry", "upload_proximity")
        if usable(signals, suppressed, n) and signals[n]["fired"]
    ]

    if strong_paper and len(session_clues) >= 2:
        parts = [signals["paper_match"]["score"]] + [signals[n]["score"] for n in session_clues]
        return {"link_type": "SAME_SESSION", "score": round(sum(parts) / len(parts), 1)}

    if usable(signals, suppressed, "encoder_fingerprint") and signals["encoder_fingerprint"]["fired"] and not strong_paper:
        return {"link_type": "SAME_DEVICE", "score": 50.0}

    if strong_paper:
        return {"link_type": "SAME_PAPER_SOURCE", "score": round(min(45.0, signals["paper_match"]["score"]), 1)}
    if weak_paper_only:
        return {"link_type": "SAME_PAPER_SOURCE", "score": round(min(30.0, signals["paper_match"]["score"]), 1)}

    return {"link_type": "NONE", "score": 0.0}
