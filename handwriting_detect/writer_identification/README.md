# Problem 1 — Writer Identification

> Parent context: [`../goal.md`](../goal.md)

## Question

Whose handwriting is on this page?

## Granularity

Per page. Each submission is scored independently.

## Input

| Field | Description |
|---|---|
| `s3_url` | Location of the uploaded image |
| `student_id` | Who submitted it |

Plus the submitter's past submissions, which supply the reference signature.

## Core idea

Convert each image into a numeric handwriting fingerprint capturing letter shape,
slant, loop size, stroke spacing and connection style — not the words. Same
writer produces similar fingerprints; different writers produce dissimilar ones.

A student's signature is the average of the fingerprints of their own past pages.
No proctored writing sample is collected; history supplies it.

Detection: fingerprint a new page, compare against the submitter's signature. A
large distance means they did not write it. Then search every other student's
signature for the closest match to name the likely true writer.

## Output

`OK` | `MISMATCH` | `UNKNOWN_WRITER` | `INSUFFICIENT_HISTORY`, with a confidence
score and, where applicable, the candidate true writer plus their match score.

## Build order

1. **Fingerprint every image.** One pass, cached by URL, never recomputed.
2. **Go/no-go gate.** Do a student's own pages cluster more tightly than random
   cross-student pairs? If not, the fingerprints are measuring something
   incidental (paper, lighting) and everything downstream is meaningless. Stop
   and fix before proceeding.
3. **Build per-student signatures.** Centroid plus spread, so naturally
   inconsistent writers get a looser threshold than very consistent ones.
4. **Score each page.** Leave-one-out, so the page under test does not pollute
   the signature it is judged against.
5. **Attribute mismatches.** Nearest-neighbour search over other students'
   signatures.
6. **Calibrate.** Hand-review the top flagged pages, move the threshold until the
   hit rate is acceptable. This number cannot be chosen theoretically.

Step 2 is the gate for the entire project.

## Modelling

No training. No labelled cheating examples. Two options:

- **Classic** — local descriptors aggregated into a fixed-length vector. Only
  fitting step is computing statistics over our own unlabelled images, CPU only,
  minutes. Starting point.
- **Pretrained** — published writer-identification model, inference only. Drop-in
  upgrade to the same pipeline if the classic route proves marginal.

## Known limits

- Cold start: fewer than roughly five past submissions yields no stable signature.
- Habitual offenders are invisible: if C always submits A's work, C's derived
  signature becomes A's handwriting and nothing looks unusual. Needs a separate
  bimodality check per student.
- Handwriting drifts with age; signatures need a rolling window, not all history.
- Pen, paper and injury changes shift the fingerprint and cause false positives.
