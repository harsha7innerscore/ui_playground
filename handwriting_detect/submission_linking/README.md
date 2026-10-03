# Problem 2 — Submission Linking

> Parent context: [`../goal.md`](../goal.md)
> Sibling problem: [`../writer_identification/`](../writer_identification/) — handwriting matching, deliberately kept separate

## Question

Were these two submissions photographed together?

Note what this is **not** asking. It does not look at the handwriting at all. It does
not ask who wrote the page, and it does not ask whether anyone cheated. It asks one
narrow physical question: do these two photos show signs of having been taken in the
same place, at the same time, with the same camera?

## Why this problem first

| Reason | Detail |
|---|---|
| No machine learning | Standard image libraries only. Nothing to train, no GPU, no model hosting |
| No history required | Works on a brand-new student's first ever submission. Problem 1 needs ~5 past submissions before it can say anything |
| Independent failure modes | Because handwriting is excluded, this never fails for the same reason Problem 1 does. The two act as honest second opinions on each other |
| Fast to ship | Days, not months |

## Granularity

Per **pair** of images. Problem 1 outputs one record per page; this outputs one record
per pair.

## Input

Scoped to one task at a time:

| Field | Description |
|---|---|
| `s3_url` | Location of the uploaded image |
| `student_id` | Who submitted it |

Plus S3 object metadata (`LastModified`, object key) where available.

Scoping to a single task matters. Comparing across unrelated assignments floods the
results with meaningless matches and makes the pair count explode.

---

## The core idea, in plain terms

When you photograph a page, the photo records far more than the writing. It records
the paper, the fold, the lamp, the angle you held the phone at, and which phone it
was. Two papers photographed at the same table carry the same traces — even when the
writing on them is completely different.

### What "fingerprint" means here

A fingerprint is **a short list of numbers summarising one aspect of a photo.**

Comparing two photos pixel by pixel is slow and fragile. Boiling each photo down to a
few numbers makes comparison into simple subtraction. Two photos are similar if their
numbers are close. Every clue below works this way: turn a visual property into
numbers, then subtract.

---

## The seven clues

### Clue 1 — Is this basically the same photo?

**Method.** Shrink the photo to an 8×8 grid — 64 squares, all detail gone, only the
broad light/dark pattern left. Convert to grey and compute the average brightness.
For each square write `1` if brighter than average, `0` if darker. The result is a
64-digit code.

**Comparison.** Count how many of the 64 digits differ. Zero = identical. Under ~6 =
the same image lightly edited (resized, re-saved, slightly cropped). Over 20 =
unrelated.

**Why shrinking helps.** It discards everything that changes between two saves of the
same image and keeps only the overall layout, so the code survives compression and
resizing.

**Catches.** The same scan submitted twice.
**Misses.** Two separate photos of the same paper — different enough to score as
unrelated.
**Information content.** Very high. 64 bits; random collision is astronomically
unlikely.

---

### Clue 2 — Separating ink from paper

Not a clue in itself, but a prerequisite for Clues 3–5.

Every clue below concerns the **paper**, so the writing must be removed first.
Otherwise two students with similar handwriting would register as the same paper, and
this problem would quietly become a worse version of Problem 1.

**Method.** Ink is dark, paper is light. Split pixels by a brightness cutoff — but not
one global cutoff, since part of the photo may be in shadow. The cutoff is computed
locally, per small region, comparing each pixel against its neighbours.

**Result.** Two masks. The ink mask is Problem 1's input. The paper mask is what
Clues 3–5 examine.

---

### Clue 3 — The paper itself

Operates only on blank areas.

**Line spacing.** Sum the darkness of every horizontal row of pixels. Ruled lines are
dark and gaps are light, producing a regularly repeating wave. The distance between
peaks is the line spacing, converted to millimetres using page width.

**Folds and creases.** A fold leaves a thin line where brightness jumps and stays
shifted — one side slightly darker than the other. Scan for long straight lines of
this kind; record position and angle.

**Stains and marks.** Blobs in the paper area that are neither ink nor ruling. Record
position, size and colour.

**Paper colour.** Average colour of the paper pixels. Captures age, brand and
whiteness.

**Catches.** Pages torn from one notebook, or the literal same sheet.
**Information content.** Mixed, and this distinction is critical. Line spacing and
paper colour are near-worthless — only a few common values exist. Fold position and
stain shape are near-unique accidents of one physical sheet.

---

### Clue 4 — The light

**Method.** A photographed page is never evenly lit; one side is brighter because
that is where the lamp is. Take the brightness of the paper across the page and fit a
tilted flat plane to it, like laying a sloped sheet over a hillside. The slope gives
two numbers:

- **Direction** — which way brightness increases
- **Steepness** — how uneven the lighting is. A bright nearby lamp gives a steep
  slope; daylight gives a flat one

Two numbers; that is the entire fingerprint.

**Catches.** Two papers photographed at the same table under the same lamp. One of
the strongest session signals, because matching someone else's lighting by accident
requires matching both position and light source.

**Fails silently.** Outdoors or in evenly-lit rooms everyone gets a flat slope and
the clue carries no information. Detect this condition and down-weight it.

**Information content.** High — if the exact continuous value is used, not a coarse
"from the left" bucket.

---

### Clue 5 — The camera angle

**Method.** Find the page's four corners. Paper edges are where brightness changes
sharply against the background, so detect edges, find straight lines, locate their
intersections.

Those corners encode how the camera was held. A perfectly square-on photo would give
a perfect rectangle; real photos give a slightly squashed shape — tilted, one edge
longer than its opposite. That distortion describes the camera's position and angle.

**Comparison.** How different are the two corner shapes? Near-identical means the
camera barely moved between shots.

**Destroyed by.** Auto-cropping. If the upload pipeline straightens pages, every
photo becomes a perfect rectangle and this clue dies completely. Must be verified
before building.

---

### Clue 6 — Which phone

Two places to look.

**EXIF.** Phones write hidden details into photo files — camera model, lens,
settings, exact capture time. Read directly. Often stripped when an app resizes an
image on upload, so it may simply be absent.

**Compression settings.** Survives more often. A JPEG file contains a table of
numbers controlling how aggressively detail is discarded. Different phones and apps
choose different tables. The table sits in the file header and is readable without
decoding the image. An identical table means the same phone model and app at the same
quality setting.

**Critical caveat.** If the whole class uses school-issued tablets, every file carries
the same table and the clue is worthless. Detect this automatically — if most students
in a task share a fingerprint, switch the clue off for that task.

---

### Clue 7 — Time

S3 records arrival time. Subtract. Forty seconds apart suggests one person uploading
two papers. Four hours apart means nothing.

---

## Low-information versus high-information clues

This distinction decides whether the system works at all.

**Low-information clues** have few possible values, so random students match often:

| Clue | Possible values | Rough chance two random students match |
|---|---|---|
| Ruled line spacing | ~4 common sizes | 30–50% |
| Paper colour | narrow range | high |
| Phone fingerprint | handful of popular models | 5–20% |
| Lighting direction, bucketed | roughly 8 directions | 10–15% |

Any of these matching alone means **almost nothing**. In a class of 10, several pairs
will share ruling and several will share a phone model purely by chance.

**High-information clues** are accidental physical details:

| Clue | Why it is rare |
|---|---|
| Fold at a specific position and angle | 3.2cm from the top at 0.5° off-horizontal is an accident of one sheet |
| Stain shape and position | Essentially unique |
| Exact lighting gradient | A continuous value, not a category |
| Near-duplicate image code | 64 bits |
| Upload 48 seconds apart | Specific, not a category |

**Only the second group is evidence.** A pair matching five low-information clues
should score low. A pair matching on fold position and stain alone should score high.

Treating all seven clues as equal and averaging them produces a useless system. This
is the single most important design decision in Problem 2.

---

## The correlated false-positive trap

Independent clues multiply, so combining them should crush the collision rate —
30% × 15% × 10% × 5% ≈ 0.02%. That reasoning is wrong, because **the clues are not
independent.**

Two students doing homework in the same classroom:

- Same school-issued notebook → ruling and paper colour match
- Same school tablet → phone fingerprint matches
- Same overhead fluorescent lights → lighting matches
- Same lesson period → upload times cluster
- Same desk height, same habit → camera angle similar

Five clues match with zero collusion. And this does not strike one random pair — it
strikes **every pair in that classroom simultaneously**. Correlated false positives
arrive in floods, not drips.

That is the real failure mode. Not two random photos coinciding, but a shared
environment making everyone look linked.

### The fix: compare against the local baseline

Do not ask *"do these two match?"*
Ask *"**do these two match more than two random students from this same classroom
do?**"*

Concretely: if 9 of 10 students in a task share a phone fingerprint, that clue carries
no information for this task — disable it. Same for ruling, lighting and paper colour.
Only what makes a pair unusual **relative to their own class** should count.

---

## Measuring the false-positive rate instead of guessing

Every rate quoted above is an estimate. Replace estimates with measurement:

**Build an impossible-pairs set.** Take pairs where collusion is physically impossible
— different schools, different cities, different months. Run the full pipeline over a
few thousand of them.

Every score produced is a false positive by construction. That yields the real
distribution of coincidence, supporting statements like "a score of 85 occurs in 0.3%
of impossible pairs" — measured, not hoped.

Set the threshold where that rate becomes acceptable. Repeat **per school**, since a
school with uniform tablets and issued notebooks has a completely different baseline
from one where students use their own phones.

A few hours of work, and it answers the viability question definitively.

---

## How many comparisons

Unordered pairs of distinct images: **N(N−1)/2**.

| Students | Pairs |
|---|---|
| 10 | 45 |
| 40 | 780 |
| 100 | 4,950 |
| 500 | 124,750 |

### Cost is linear, not quadratic

Split the work:

1. **Extract once per image** — N operations. Masks, paper features, lighting,
   geometry, encoder table, timestamp. Roughly 1 second per image. This is the real
   cost.
2. **Compare pairwise** — N² operations, but each is arithmetic on short numeric
   vectors. Microseconds. Effectively free.

500 students = 500 extractions (~8 minutes) plus 124k trivial comparisons (<1 second).

**Cache extracted features keyed by `s3_url`.** Never recompute. A student appearing
in 20 tasks would otherwise be extracted 20 times.

### When students upload multiple pages

Multi-page homework breaks the clean arithmetic. Three pages each across 10 students
gives 30 images and 435 image-pairs — but still only 45 **student-pair** verdicts.
Compare all image pairs, then aggregate: a student-pair's score is the max, or a
top-k mean, across their page pairs. Decide this before fixing the output schema.

---

## Output

### Per-task report

```json
{
  "task_id": "task_7731",
  "students_submitted": 38,
  "pairs_compared": 703,
  "pairs_flagged": 2,
  "links": [
    {
      "student_a": "student_A",
      "student_b": "student_C",
      "link_type": "SAME_SESSION",
      "score": 91,
      "signals": {
        "image_near_duplicate": { "fired": false, "distance": 31 },
        "paper_match":          { "fired": true,  "score": 88, "detail": "same fold position, same ruling pitch, matching stain top-right" },
        "lighting_match":       { "fired": true,  "score": 94, "detail": "light from upper-left at same angle, same shadow falloff" },
        "camera_geometry":      { "fired": true,  "score": 79, "detail": "near-identical camera pose and crop" },
        "encoder_fingerprint":  { "fired": true,  "score": 100, "detail": "identical JPEG quantisation table" },
        "upload_proximity":     { "fired": true,  "score": 96, "detail": "uploaded 48 seconds apart" }
      },
      "plain_reason": "These two papers appear to have been photographed one after the other, on the same desk, under the same light, with the same phone.",
      "images": ["s3://.../hw_8840.jpg", "s3://.../hw_8841.jpg"]
    }
  ]
}
```

### `link_type` — the field that carries the meaning

A score alone is useless to a teacher. *Which* clues fired says what kind of link it
is:

| `link_type` | Fires when | Strength | Innocent explanation |
|---|---|---|---|
| `SAME_IMAGE` | Near-duplicate code | Strongest | Almost none — same file submitted twice |
| `SAME_SESSION` | Paper + lighting + geometry + timing all match | Strong | Studied together at one table |
| `SAME_DEVICE` | Encoder fingerprint matches, session clues do not | Moderate | Siblings, shared family phone, school tablet |
| `SAME_PAPER_SOURCE` | Same ruling or notebook, nothing else | Weak | Same stationery shop, school-issued pads |
| `NONE` | Below threshold | — | — |

`SAME_DEVICE` alone on school tablets fires constantly and means nothing.
`SAME_SESSION` is the one worth a teacher's attention.

### Reviewer view

One card per flagged pair: both photos side by side, every contributing clue listed in
plain language, and an explicit note that this is not an accusation.

Example:

> **⚠️ Nikhil & Riya — score 91**
>
> - Both papers have a horizontal fold in the same place and the same brown mark in the
>   top-right corner — likely torn from the same notebook
> - In both photos the light comes from the upper-left at the same angle, with the
>   shadow falling the same way
> - Both were photographed from almost exactly the same height and tilt
> - Both files were saved by the same phone
> - Uploaded 48 seconds apart
>
> **Plain English:** These two papers were almost certainly photographed in one
> sitting, at the same table, with the same phone.
>
> **This is not an accusation.** They may have studied together. A teacher should look
> at both papers and decide.

### Three output design rules

1. **Emit raw distances, not just booleans.** Thresholds cannot be calibrated from
   data that was never recorded. Store every clue's numeric value on every pair
   evaluated, including unflagged ones — the distribution is needed to choose cutoffs.
2. **Collapse pairs into groups.** If A–C, A–B and B–C all link, that is one group of
   three students, not three findings. A teacher should see one card.
3. **Flag suppressed clues explicitly.** When a clue is disabled for a task because
   the whole class shares it, say so in the output. A reviewer needs to know what was
   not considered.

---

## Combining the clues into a score

Each clue yields 0 (nothing in common) to 100 (identical). Six numbers per pair.

**Do not average them.** Start with rules reflecting information content:

- Near-duplicate image code matches → score high immediately, nothing else matters
- Lighting + geometry + timing all match → strong; hard to produce by accident
- Only phone matches → weak; shared devices are common
- Only paper type matches → weak; friends buy the same notebooks

Then examine real flagged pairs, identify which clues actually separated true links
from coincidences, and adjust. The cut-off cannot be chosen in advance — run on real
submissions, hand-check the top 20 pairs, count how many are real, move the threshold.
That calibration step is unavoidable.

---

## Honest expectations

| Scenario | Caught? |
|---|---|
| Same image uploaded twice | Reliably |
| Two photos, same sitting, home setting | Usually |
| Two photos, same sitting, inside a uniform classroom | Weakly — the shared baseline swamps the signal |
| Separate sittings, same shared notebook | No, and it should not |
| Answers copied by hand at home, alone | No — nothing physical links the photos |

Value therefore depends heavily on **where students actually photograph their
homework**, which can be determined from the images themselves.

### What this never establishes

- Who wrote the page — that is Problem 1
- Who copied from whom — upload order is a weak hint, not proof
- That anything wrong happened — a study group at one kitchen table produces exactly
  the same reading as copying

The system reports a physical fact. The teacher supplies the judgement.

---

## Build order

1. **Probe the pipeline first.** See below — this determines what is buildable.
2. Exact and near-duplicate detection. Zero cost, catches the laziest case
   immediately.
3. Ink/paper separation.
4. Paper, lighting and geometry features.
5. Encoder fingerprint and upload timing.
6. Per-task baseline suppression (disable clues the whole class shares).
7. Pairwise scoring, grouping, reviewer output.
8. Impossible-pairs calibration to set thresholds against a measured
   false-positive rate.

## Prerequisite: probe the upload pipeline

Three of the seven clues can be destroyed before the image ever reaches S3:

| If the pipeline... | ...this dies |
|---|---|
| Resizes images | EXIF |
| Re-encodes images | Compression fingerprint (replaced by the server's) |
| Auto-crops and straightens | Camera angle |

Half an hour checking real S3 objects from `ocr-worksheet-details` establishes which
clues actually exist. Everything in this document is contingent on that result.

### Probe results (real sample)

One worksheet pulled via [`../scripts/fetch_journey_worksheets.py`](../scripts/fetch_journey_worksheets.py)
(journey `6abb24b2c656dbb3664cf827`, image downloaded directly from
`student-handwritten.s3.amazonaws.com` and its raw JPEG segments walked by hand).
Single sample — confirms what's possible, not yet a population-level guarantee.

| Clue dependency | Status | Detail |
|---|---|---|
| EXIF | **Dead** | Only an `APP0 JFIF` marker present, no `APP1 Exif` segment at all. Upload pipeline strips or never writes it. Clue 6 loses its EXIF half entirely. |
| JPEG quantisation tables | **Alive** | Two `DQT` segments present, baseline `SOF0`, standard 4 Huffman tables. Clue 6's encoder-fingerprint half is usable as-is — hash/compare the DQT bytes. |
| S3 object `Last-Modified` | **Alive** | Present on the object's HTTP headers independent of Mongo's `created_at`/`updated_at`. Clue 7 should read this directly off S3 (HEAD request), not trust the Mongo timestamp, since Mongo's write time can lag the actual upload. |
| Auto-crop / straighten (Clue 5) | **Unconfirmed** | One image, 1023×1538 portrait, not obviously force-cropped to a fixed aspect ratio — but can't confirm corner geometry survives without comparing multiple images from the same pipeline. Needs a same-student, multi-submission sample. |
| Content-Type header | N/A for any clue | Stored as `binary/octet-stream` instead of `image/jpeg` — sloppy upload, not a blocker, just noted. |

**Schema found in `ocr-worksheet-details`** (for whoever writes the extraction step):

- Submitter is `user_id`, not `student_id`. Page images are `image_urls` (array of
  `https://` S3 urls, not `s3://` scheme) and duplicated per-page under `pages[].image`.
- `quality_checks[<image_url>].cv_quality_metrics` already computes `brightness`,
  `contrast`, `shadows`, and `hough_orientation_angle` per image. This overlaps Clue 4
  (lighting) and partially Clue 5 (orientation) — worth reusing instead of
  recomputing, pending a check that its brightness/contrast definitions match what
  Clue 4 needs (plane-fit slope, not a single scalar).

**Implication for build order:** Clue 6 is now a one-sided clue (quant table only,
no EXIF) — weaker than assumed, since quant tables are shared by every image from the
same phone/app/quality-setting, which is exactly the low-information failure mode
Clue 6 was already flagged for. Clue 7 should be built against S3 metadata, not Mongo
timestamps. Clue 5 still needs its own probe before being trusted.

### Second probe: a real task's submissions — a different, harder upload path

The first probe was one ad-hoc journey. Pulling a full task via
[`../scripts/get_task_worksheets/`](../scripts/get_task_worksheets/) (14 students, 3-4
pages each) surfaced a second, more consequential upload path: every image key is
`pdf-pages/<worksheet_id>/page_N_<hash>.jpg`. These pages were not uploaded as
individual phone photos — a PDF was uploaded and the server rasterised it into one
image per page. Confirmed by inspecting the actual files:

| Property | Finding |
|---|---|
| Encoding | **Progressive JPEG**, 96 DPI density — the signature of a server-side rasteriser (e.g. a PDF-to-image library), not a phone camera, which writes baseline JPEG with no DPI tag and real EXIF |
| Quantisation tables (Clue 6) | **Identical across different students.** Two unrelated students' pages hashed to the exact same DQT bytes. Not a classroom-correlation problem — this is the whole student population sharing one fingerprint. Clue 6 carries **zero information** on this upload path, not just "weak" |
| Page framing (Clue 5) | Page fills the frame edge-to-edge, no background/desk visible. There are no real corners to find — a corner-detector will return the image boundary itself for every single image, i.e. a perfect, identical "distortion" value for everyone. Clue 5 is **dead** here, confirming the risk flagged in the prerequisite table |
| Visual appearance | Clean, evenly-lit, white background — consistent with scan/PDF enhancement (contrast flattening), not a raw photo. **Suspect Clue 4 (lighting) is also suppressed** on this path, though not yet measured directly — worth checking the fitted plane's steepness distribution once the pipeline runs on more tasks |
| Still alive | Clue 1 (near-duplicate hash), Clue 3 (paper: ruling/fold/stain — content of the scan itself, unaffected by re-rastering), Clue 7 (S3 `Last-Modified`, confirmed independent per page) |

**Implication:** submissions arrive by at least two different routes — direct photo
upload (first probe) and PDF-rasterised pages (this probe) — with very different
clue availability. The per-task baseline-suppression mechanism already designed above
handles this correctly *if* it's measured per task rather than assumed globally: a
task where everyone's pages are PDF-rasterised will auto-suppress Clues 5 and 6 (and
likely 4) because the fire-rate will be ~100%, leaving Clue 1/3/7 to carry the task.
Do not hardcode "PDF path = clues 4/5/6 are dead" — detect it from the measured
fire-rate per task, since the upload route isn't a field we're given directly.

## Implementation

A first pipeline lives in [`pipeline/`](pipeline/), built in the order above:

- `features.py` — per-image extraction for all seven clues (dhash, ink/paper masks,
  ruling pitch, paper colour, fold lines, stain blobs, lighting plane fit, page-quad
  distortion, JPEG quant-table hash). Uses OpenCV + numpy only, no ML.
- `s3_timing.py` — Clue 7 via an S3 HEAD request's `Last-Modified`, not Mongo's
  timestamp (see probe above).
- `scoring.py` — turns two images' features into the six named signals from the
  output schema below, with raw distances kept alongside every score.
- `suppression.py` — measures each clue's fire-rate across all of one task's pairs
  and disables any clue above a threshold, per the correlated-false-positive fix.
- `classify.py` — rule-based (not averaged) combination into `link_type` + `score`.
- `grouping.py` — union-find to collapse linked pairs into groups.
- `main.py` — orchestrator: takes a `*_submissions.json` from
  [`../scripts/get_task_worksheets/`](../scripts/get_task_worksheets/), extracts
  features once per image (cached by url under `pipeline/cache/`), scores every
  cross-student image pair, aggregates to student-pairs by max score across their
  page-pairs, and writes `pipeline/output/<task_id>_links.json`.

Not yet done: impossible-pairs calibration (thresholds above are starting points,
not measured), and the Clue 4/5/6 suppression confirmation on more than one task.

## Modelling

None. No machine learning at any point, and no labelled examples of past cheating.
Image hashing, pixel statistics and metadata comparison via standard libraries.
