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
