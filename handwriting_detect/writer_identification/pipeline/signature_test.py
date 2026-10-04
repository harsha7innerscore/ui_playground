#!/usr/bin/env python3
"""Leave-one-out identification accuracy -- the real acceptance test.

The gate and the AUC check (gate.py, auc_check.py) ask an abstract question:
is there more signal than noise. This asks the concrete one Case 1 actually
needs answered: build a student's signature from their *other* worksheets,
hold one worksheet out, and see whether it gets matched to the right student
among all enrolled students.

This is closed-set accuracy (per case1_identification.md): the true writer is
guaranteed to be one of the 11 enrolled students. Real use is open-set (the
writer might be nobody enrolled), which is harder and not what this measures
-- but closed-set accuracy is the right first number, and the natural
escalation from the pairwise AUC check.

Uses cached fingerprints only, no network.
"""

from collections import defaultdict

import numpy as np

import gate
import main


def main_cli():
    items, total, skipped = main.load_items()
    print(f"Loaded {len(items)}/{total} pages ({skipped} skipped) from cache")

    by_worksheet = defaultdict(list)
    for item in items:
        by_worksheet[item["worksheet_id"]].append(item)

    worksheets = []
    for worksheet_id, group in by_worksheet.items():
        stacked = np.vstack([g["raw_vector"] for g in group])
        worksheets.append(
            {
                "worksheet_id": worksheet_id,
                "user_id": group[0]["user_id"],
                "raw_vector": np.nanmean(stacked, axis=0),
            }
        )

    standardized = gate.standardize([w["raw_vector"] for w in worksheets])
    for w, vec in zip(worksheets, standardized):
        w["vector"] = vec

    by_student = defaultdict(list)
    for w in worksheets:
        by_student[w["user_id"]].append(w)

    students = sorted(by_student)
    print(f"{len(worksheets)} worksheets across {len(students)} students\n")

    correct = 0
    total_scored = 0
    margins = []
    confusions = []

    for held_out in worksheets:
        owner = held_out["user_id"]
        own_others = [w for w in by_student[owner] if w["worksheet_id"] != held_out["worksheet_id"]]
        if not own_others:
            continue  # need at least one other worksheet to build this student's signature

        own_signature = np.nanmean(np.vstack([w["vector"] for w in own_others]), axis=0)
        own_distance = gate.distance(held_out["vector"], own_signature)
        if own_distance is None:
            continue

        best_other_id, best_other_distance = None, None
        for student_id in students:
            if student_id == owner:
                continue
            signature = np.nanmean(np.vstack([w["vector"] for w in by_student[student_id]]), axis=0)
            d = gate.distance(held_out["vector"], signature)
            if d is not None and (best_other_distance is None or d < best_other_distance):
                best_other_id, best_other_distance = student_id, d

        if best_other_distance is None:
            continue

        total_scored += 1
        is_correct = own_distance < best_other_distance
        correct += int(is_correct)
        margins.append(best_other_distance - own_distance)  # positive = correct direction
        if not is_correct:
            confusions.append((held_out["worksheet_id"], owner, best_other_id))

    accuracy = correct / total_scored if total_scored else 0.0
    random_baseline = 1.0 / len(students)

    print(f"Top-1 accuracy: {correct}/{total_scored} = {accuracy:.1%}")
    print(f"Random baseline (1/{len(students)} students): {random_baseline:.1%}")
    print(f"Margin (own-signature distance below nearest wrong student): "
          f"median {np.median(margins):+.3f}, {sum(1 for m in margins if m > 0)}/{len(margins)} positive")

    if confusions:
        print(f"\nMisidentified ({len(confusions)}):")
        for worksheet_id, true_owner, guessed in confusions[:15]:
            print(f"  worksheet {worksheet_id}: true={true_owner}  guessed={guessed}")


if __name__ == "__main__":
    main_cli()
