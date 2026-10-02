# Problem 2 — Submission Linking

> Parent context: [`../goal.md`](../goal.md)

## Question

Are these two submissions connected to each other?

## Granularity

Per pair of pages.

## Input

| Field | Description |
|---|---|
| `s3_url` | Location of the uploaded image |
| `student_id` | Who submitted it |

Plus S3 object metadata (`LastModified`, object key) where available. No history
required — this works from the very first submission.

## Core idea

Compare pages directly against each other on physical and photographic evidence,
independent of handwriting. Two papers photographed in one sitting share far more
than their contents.

## Signals

| Signal | What it catches |
|---|---|
| Near-duplicate image hash | The same scan uploaded twice |
| Paper surface — ruling pitch, folds, creases, stains, colour | Same physical sheet or same pad |
| Illumination gradient direction and intensity | Same lamp, same angle |
| Camera geometry — corner shape, perspective, crop | Same camera pose |
| JPEG encoder and quantisation table | Same device |
| Upload timing proximity | Same sitting |

Which combination fires tells you *which* kind of link it is, not merely that one
exists. Content match plus image match plus device match is the strong case.
Device match alone, with different content, is usually innocent — siblings
sharing a phone.

## Output

Ranked pairs with per-signal distances and a combined linkage score. Reported as
evidence, never as a verdict.

## Build order

1. **Exact and near-duplicate detection.** Byte hash, then perceptual hash. Zero
   cost, catches the laziest case immediately.
2. **Separate ink from paper.** Everything below operates on the paper-only
   pixels, so handwriting does not contaminate the physical signals.
3. **Paper, lighting and geometry features.**
4. **Encoder fingerprint and upload timing.**
5. **Pairwise scoring.** Rank, hand-review the top pairs, calibrate a threshold.

## Scoping

Compare within a cohort and assignment where possible — pairwise comparison is
quadratic, and comparing across unrelated assignments floods the results with
meaningless matches. We have no `task_id`, but if worksheets are printed
templates the printed pixels cluster, which recovers assignment grouping for
free.

## Modelling

None. No machine learning at any point. Image hashing, pixel statistics and
metadata comparison via standard libraries.

## Known limits

- Establishes that two submissions are linked, not who copied whom.
- Blind to dictation — if the answers were shared verbally and each student wrote
  their own page on their own desk, every signal here is clean.
- Depends on what survives the upload pipeline. If images are resized or
  re-encoded on upload, EXIF and encoder fingerprints are gone; if they are
  auto-cropped and deskewed, the geometry signal goes too. Probe a sample before
  building on any of these.
