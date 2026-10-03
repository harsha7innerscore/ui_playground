"""Per-task baseline suppression (../README.md: "compare against the local
baseline"). A clue that fires for most pairs in a task carries no information
for that task — likely a shared classroom environment, not evidence of a link.
"""

CLUE_NAMES = (
    "image_near_duplicate",
    "paper_match",
    "lighting_match",
    "camera_geometry",
    "encoder_fingerprint",
    "upload_proximity",
)


def compute_suppressed_clues(all_pair_signals, fire_threshold=0.5):
    """Returns {clue_name: fire_rate} for clues that fired in more than
    fire_threshold of all evaluated pairs."""
    suppressed = {}
    for name in CLUE_NAMES:
        if name == "image_near_duplicate":
            continue  # genuinely rare by construction; never suppress
        fired_flags = [p[name]["fired"] for p in all_pair_signals if p[name].get("score") is not None]
        if not fired_flags:
            continue
        fire_rate = sum(fired_flags) / len(fired_flags)
        if fire_rate > fire_threshold:
            suppressed[name] = round(fire_rate, 2)
    return suppressed


# paper_match is a composite (fold + stain + pitch + colour). A sub-signal
# that fires for most of the task — e.g. every page sharing the same printed
# margin line, misread as an "accidental fold" — is exactly the same
# correlated-false-positive failure mode, one level deeper. Suppress these
# independently of the top-level six, or a shared-stationery classroom
# flags every single pair (observed: 55/55 on a real task before this fix).
PAPER_SUBCLUES = {
    "fold_match_pct": lambda detail: detail["fold_match_pct"] > 60,
    "stain_match_pct": lambda detail: detail["stain_match_pct"] > 60,
    "ruling_pitch_score": lambda detail: detail["ruling_pitch_score"] is not None and detail["ruling_pitch_score"] > 70,
    "paper_colour_score": lambda detail: detail["paper_colour_score"] is not None and detail["paper_colour_score"] > 70,
}


def compute_suppressed_paper_subclues(all_pair_signals, fire_threshold=0.5):
    suppressed = {}
    for name, fires in PAPER_SUBCLUES.items():
        flags = [fires(p["paper_match"]["detail"]) for p in all_pair_signals]
        if not flags:
            continue
        fire_rate = sum(flags) / len(flags)
        if fire_rate > fire_threshold:
            suppressed[name] = round(fire_rate, 2)
    return suppressed
