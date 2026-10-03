 # Handwriting Detect — Project Summary

A walkthrough of what exists, why it was built this way, and what to say when
explaining it to someone else.

> Scope note: this document covers **Problem 2 (Submission Linking)**, which is the
> part that has been built. Problem 1 (Writer Identification) is still a design
> document only — see [`writer_identification/README.md`](writer_identification/README.md).

---

## 1. What was done

**The underlying question.** Students submit homework as photos/scans of handwritten
pages. Sometimes the person who submitted a page is not the person who wrote it. We
want to surface that for a teacher — as evidence, never as a verdict.

The work splits into two independent problems (see [`goal.md`](goal.md)):

| | Problem 1 — Writer Identification | Problem 2 — Submission Linking |
|---|---|---|
| Question | Whose handwriting is this? | Were these two pages photographed together? |
| Granularity | Per page | Per pair of pages |
| Looks at | The handwriting | Everything *except* the handwriting |
| Needs history? | Yes (~5 past submissions) | No — works on a first submission |
| Needs ML? | Yes (fingerprint model) | **No** — image stats + metadata only |
| Status | **Design doc only** | **Built and run on real data** |

Problem 2 was built first on purpose: no ML, no training data, no history
requirement, and its failure modes are completely independent of Problem 1's — so
the two can act as honest second opinions on each other.

**Concretely delivered:**

1. Two data-fetching scripts (Mongo → S3 urls), under [`scripts/`](scripts/).
2. A full Problem 2 pipeline, under [`submission_linking/pipeline/`](submission_linking/pipeline/).
3. Two rounds of *pipeline probing* — downloading real submission images and
   inspecting their raw bytes to find out which clues actually survive the upload
   path before building anything on top of them.
4. A real end-to-end run on a live task (11 students, 43 page images, 903 image
   pairs), which found a significant bug and produced a calibration dataset.

---

## 2. How the problem was solved

### The core insight

When you photograph a page, the photo records far more than the writing: the paper,
the fold, the lamp, the angle of the phone, and which phone it was. Two papers
photographed at the same table carry the same traces **even when the writing on them
is completely different.**

So Problem 2 never looks at handwriting at all. It asks one narrow physical question:
*do these two photos show signs of having been taken in the same place, at the same
time, with the same camera?*

### Turning that into arithmetic

Comparing two photos pixel-by-pixel is slow and fragile. Instead every clue is
reduced to **a short list of numbers** summarising one aspect of the photo.
Comparison then becomes simple subtraction. This also makes the cost linear rather
than quadratic:

- **Extract once per image** → N operations, ~1s each. This is the real cost.
- **Compare pairwise** → N² operations, but each is arithmetic on short vectors.
  Microseconds. Effectively free.

Features are cached keyed by `s3_url` and never recomputed.

### The two design decisions that actually matter

**(a) Never average the clues.** Clues differ enormously in information content:

- *Low-information* clues have few possible values, so random students match often.
  Ruled line spacing has ~4 common sizes. Paper colour sits in a narrow range.
- *High-information* clues are accidental physical details: a fold 3.2cm from the top
  at 0.5° off-horizontal is an accident of **one physical sheet**.

Five low-information clues matching means almost nothing. Fold position plus stain
shape matching means a great deal. Averaging them produces a useless system, so
scoring is **rule-based**, not a weighted mean.

**(b) Compare against the local baseline, not against the absolute.** The naive
assumption is that independent clues multiply, so combining them crushes the
collision rate. That reasoning is wrong — **the clues are not independent.** Two
students in one classroom share: issued notebook (ruling + colour), school tablet
(encoder fingerprint), overhead lights (lighting), lesson period (timing), desk
height (camera angle). Five clues match with zero collusion — and it doesn't strike
one random pair, it strikes **every pair in that classroom simultaneously.**
Correlated false positives arrive in floods, not drips.

So the system never asks *"do these two match?"* It asks *"do these two match **more
than two random students from this same task** do?"* Mechanically: measure each
clue's fire-rate across all pairs in the task, and if a clue fires for most of them,
**disable it for that task and say so in the output.**

---

## 3. The clues, and how each one is computed

Seven clues. Clue 2 is a prerequisite rather than a clue in itself.

### Clue 1 — Is this basically the same photo?
**Method.** Shrink to an 8×8 grid (64 squares, all detail gone), convert to grey,
take the mean. Each square becomes `1` if brighter than the mean, `0` if darker →
a 64-bit code.
**Compare.** Count differing bits (Hamming distance). 0 = identical, under ~6 = the
same image lightly edited, over 20 = unrelated.
**Why shrinking helps.** It discards everything that changes between two saves of the
same image and keeps only the layout, so the code survives compression and resizing.
**Information content.** Very high — 64 bits, collisions astronomically unlikely.
**Code.** `features.dhash`

### Clue 2 — Separating ink from paper *(prerequisite for Clues 3–5)*
Every clue below concerns the **paper**, so the writing must be removed first —
otherwise two students with similar handwriting register as the same paper and
Problem 2 quietly becomes a worse version of Problem 1.
**Method.** Ink is dark, paper is light. Split by a brightness cutoff computed
**locally** per small region (not one global cutoff, since part of the photo may be
in shadow). Produces two masks: the ink mask is Problem 1's input, the paper mask
feeds Clues 3–5.
**Code.** `features.ink_paper_masks` (adaptive Gaussian threshold, block size scaled
to image dimensions)

### Clue 3 — The paper itself
Four sub-signals, operating only on blank areas:

| Sub-signal | Method | Information content |
|---|---|---|
| **Line spacing** | Sum darkness of each pixel row → ruled lines produce a repeating wave → autocorrelation peak gives the pitch | **Low** — only a few common sizes exist |
| **Paper colour** | Mean colour of paper-mask pixels. Captures age, brand, whiteness | **Low** — narrow range |
| **Folds / creases** | Canny edges → `HoughLinesP` for long straight lines spanning >60% of the page → record angle + position as a *fraction* of the page, so it's comparable across image sizes | **High** — an accident of one sheet |
| **Stains / marks** | Colour outliers inside the paper area (>40 units from median paper colour) → connected components → filter by area to drop speckle and whole-page blobs | **High** — essentially unique |

**Code.** `features.ruling_pitch`, `paper_colour`, `fold_lines`, `stain_blobs`

### Clue 4 — The light
**Method.** A photographed page is never evenly lit; one side is brighter because
that's where the lamp is. Fit a tilted plane to brightness across the paper area —
like laying a sloped sheet over a hillside. Two numbers fall out: **direction**
(which way brightness increases) and **steepness** (a bright nearby lamp gives a
steep slope; daylight gives a flat one). That's the entire fingerprint.
**Why it's strong.** Matching someone else's lighting by accident requires matching
both position *and* light source.
**Fails silently.** Outdoors or in evenly-lit rooms everyone gets a flat slope and
the clue carries no information — so the flat case is detected and flagged.
**Code.** `features.lighting_plane` (least-squares plane fit)

### Clue 5 — The camera angle
**Method.** Find the page's four corners (edges → straight lines → intersections). A
perfectly square-on photo gives a perfect rectangle; real photos give a slightly
squashed shape. That distortion describes the camera's position and angle.
**Destroyed by auto-cropping** — and it was. See §4.
**Code.** `features.page_quad_distortion`

### Clue 6 — Which phone
Two places to look:
- **EXIF** — camera model, lens, settings, capture time. Read directly from the file.
- **Compression settings** — a JPEG contains a quantisation table controlling how
  aggressively detail is discarded. Different phones and apps pick different tables.
  It sits in the file header and is readable **without decoding the image**.

**Code.** `features.jpeg_quant_fingerprint` (walks JPEG markers, hashes the DQT
segments). Both halves turned out to be unusable here — see §4.

### Clue 7 — Time
S3 records arrival time. Subtract. 40 seconds apart suggests one person uploading two
papers; four hours apart means nothing. Scored with exponential decay (100 at 0s,
~50 at 10 min, ~0 after a few hours).
**Important:** read from the **S3 object's `Last-Modified` header**, not Mongo's
`created_at` — Mongo's write time can lag the actual upload.
**Code.** `s3_timing.get_last_modified`

---

## 4. Issues encountered and fixed

This is the most useful section to understand, because every issue here is a
*finding*, not just a bug.

### Issue 1 — EXIF is stripped (found by probing, before building)
Walked the raw JPEG markers of a real submission: only an `APP0 JFIF` segment, **no
`APP1 Exif` segment at all.** Clue 6 lost its EXIF half entirely.
**Resolution:** build Clue 6 on quantisation tables only.

### Issue 2 — Mongo timestamps aren't the upload time
S3's object `Last-Modified` header exists and is independent of Mongo's
`created_at`/`updated_at`.
**Resolution:** Clue 7 reads S3 headers via a HEAD request, not the database.

### Issue 3 — There are (at least) two different upload paths
The first probe was a direct photo upload. Pulling a **full task** revealed a second,
much harder path: every image key was `pdf-pages/<worksheet_id>/page_N_<hash>.jpg`.
These weren't individual phone photos — a **PDF was uploaded and the server
rasterised it** into one image per page. Confirmed by inspecting the files:
progressive JPEG at 96 DPI (the signature of a server-side rasteriser; phones write
baseline JPEG with no DPI tag and real EXIF).

Consequences, each verified rather than assumed:

| Clue | What happened | Evidence |
|---|---|---|
| **Clue 6 — encoder** | **Dead across the entire population.** Two *unrelated* students' pages hashed to byte-identical quantisation tables. Not classroom correlation — every student shares one fingerprint | Fired on 100% of pairs |
| **Clue 5 — geometry** | **Dead.** The page fills the frame edge-to-edge, no desk visible. There are no real corners to find | Corner detection returned `null` for every image |
| **Clue 4 — lighting** | **Mostly dead.** Scan enhancement flattens the illumination gradient | Fired on 59% of pairs |
| **Clues 1, 3, 7** | Survive — they describe the scanned content and the upload event, not the camera | — |

**Resolution — and the important part:** this is *not* hardcoded as "PDF path ⇒
clues 4/5/6 are dead." The upload route isn't a field we're given, and a direct-photo
task would behave differently. Instead the fire-rate is **measured per task**, and
any clue firing for >50% of pairs is auto-suppressed and recorded in the output. On
this task that mechanism independently discovered all three deaths on its own.

### Issue 4 — The flood: 55 out of 55 pairs flagged
The first real run linked **every student to every other student.** Precisely the
correlated-false-positive flood the design predicted — but one layer deeper than
where suppression was running.

Root cause: suppression ran on the six *top-level* signals, but `paper_match` is a
**composite** of four sub-signals, and those were never checked. Measuring each
across all 903 image pairs:

| Paper sub-signal | Fire rate | Verdict |
|---|---|---|
| `paper_colour_score` > 70 | **92.2%** | The flood |
| `ruling_pitch_score` > 70 | 33.3% | High but under threshold |
| `stain_match_pct` > 60 | 1.2% | Behaving correctly |
| `fold_match_pct` > 60 | 0.9% | Behaving correctly |

Paper colour matched on almost every pair and tipped every pair into the weak-link
category.

**Fix.** Baseline suppression now runs on the paper sub-signals independently
(`suppression.compute_suppressed_paper_subclues`). Result: 39/55 flagged, all in the
weakest category, scores 12–45 instead of a uniform flood.

**The transferable lesson:** baseline suppression isn't a property of the six named
signals — it must run on **every sub-score that feeds a verdict**, at whatever level
it's computed, or a shared-environment classroom floods through whichever level
wasn't checked.

### Issue 5 — A `HoughLinesP` unpacking bug
OpenCV returned a different array shape than assumed; fixed with `np.ravel`.

### Issue 6 (OPEN, and the most important one) — the high-information clues barely fire
Fold detection found **at most one** candidate line per image, mean 0.23 across 43
images. Stain matching fired on 1.2% of pairs.

Their low fire-rates are **ambiguous in a way the current data cannot resolve**:

- *Reading A:* these accidents are genuinely rare — which is exactly what makes them
  high-information. The system is working.
- *Reading B:* the detectors are under-sensitive on rasterised, contrast-flattened
  scans and are **missing real folds and stains.**

These have opposite implications. Until it's resolved by eyeballing a sample of pages
against what the detector found, **the only clues doing real work on this upload path
are paper colour and ruling — both low-information.** This is the single biggest open
question for Problem 2.

---

## 5. Link types

A score alone is useless to a teacher. *Which* clues fired is what says what kind of
link it is.

| `link_type` | Fires when | Strength | Innocent explanation |
|---|---|---|---|
| `SAME_IMAGE` | Near-duplicate hash matches | **Strongest** | Almost none — the same file submitted twice |
| `SAME_SESSION` | Strong paper evidence (fold/stain) **plus** ≥2 of lighting / geometry / timing | **Strong** | They studied together at one table |
| `SAME_DEVICE` | Encoder fingerprint matches, session clues don't | Moderate | Siblings, shared family phone, school tablet |
| `SAME_PAPER_SOURCE` | Paper evidence only, nothing corroborating | **Weak** | Same stationery shop, school-issued pads |
| `NONE` | Below threshold | — | — |

`SAME_DEVICE` on school tablets fires constantly and means nothing.
**`SAME_SESSION` is the one worth a teacher's attention.**

Note the evaluation order matters: `SAME_IMAGE` short-circuits everything, and strong
paper evidence must be corroborated by session clues before it can reach
`SAME_SESSION`. Scores are capped by category — `SAME_PAPER_SOURCE` can never exceed
45 no matter how well the paper matches, because the category itself is weak evidence.

---

## 6. Output format

Two files per task, written to `pipeline/output/`.

### `<task_id>_links.json` — the report

```json
{
  "task_id": "6aa3d2192b1bf0252fe8ab41",
  "students_submitted": 11,
  "pairs_compared": 55,
  "pairs_flagged": 39,
  "suppressed_clues": {
    "lighting_match": 0.59,
    "camera_geometry": 1.0,
    "encoder_fingerprint": 1.0
  },
  "suppressed_paper_subclues": { "paper_colour_score": 0.93 },
  "links": [ /* one object per flagged student-pair, highest score first */ ],
  "groups": [ /* students collapsed into connected components */ ]
}
```

`suppressed_clues` is not decoration — it is **required output**. A reviewer needs to
know what was *not* considered, and the number is the measured fire-rate that caused
the suppression.

Each entry in `links`:

```json
{
  "student_a": "69ccfec2dbfe1748cf0fd9f3",
  "student_b": "69ccfec7dbfe1748cf0fda1c",
  "link_type": "SAME_PAPER_SOURCE",
  "score": 45.0,
  "signals": {
    "image_near_duplicate": { "fired": false, "distance": 29, "score": 54.7 },
    "paper_match": {
      "fired": true, "score": 67.7,
      "detail": {
        "fold_match_pct": 100.0, "stain_match_pct": 10.0,
        "ruling_pitch_score": 100.0, "paper_colour_score": 77.08
      }
    },
    "lighting_match": { "fired": false, "score": 49.9, "detail": { "...": "..." } },
    "camera_geometry": { "fired": false, "score": null,
                         "detail": "page corners not found in one or both images" },
    "encoder_fingerprint": { "fired": true, "score": 100.0, "detail": { "...": "..." } },
    "upload_proximity": { "fired": false, "score": 47.1,
                          "detail": { "seconds_apart": 452.0 } }
  },
  "images": ["https://...page_2_....jpg", "https://...page_2_....jpg"]
}
```

Every signal carries three things: `fired` (did it trip its threshold), `score`
(0–100), and `detail` (the **raw** measurement). `score: null` means the clue could
not be computed at all — distinct from a score of 0, which means it was computed and
found nothing in common.

### `<task_id>_all_pairs.json` — the calibration dump

The same per-pair records for **every** pair evaluated, including the ones that
weren't flagged. Thresholds cannot be calibrated from data that was never recorded —
the distribution of unflagged pairs is exactly what's needed to choose cutoffs later.

### Three output design rules
1. **Emit raw distances, not just booleans** — for every pair, including unflagged.
2. **Collapse pairs into groups** — if A–C, A–B and B–C all link, that is one group
   of three students, not three findings. A teacher should see one card.
3. **Flag suppressed clues explicitly** — a reviewer needs to know what was skipped.

---

## 7. Things to know when explaining this to someone else

### The one-sentence version
*"It checks whether two homework photos were taken in the same place at the same
time — by looking at the paper, the lighting and the camera, never at the
handwriting — and it only counts a clue if that clue is unusual **for that
particular class**."*

### Points people reliably get wrong

**It is not an accusation system.** The output is evidence for a human. We are making
claims about minors; false positives land on real students. Every flag must be
reviewable, explainable and appealable.

**A link is not proof of cheating.** A study group at one kitchen table produces
*exactly* the same reading as copying. The system reports a physical fact; the
teacher supplies the judgement.

**It cannot establish direction.** It reports that A and C are linked, never who
copied from whom. Upload order is a weak hint, not proof.

**Thresholds here are guesses, and are labelled as such.** Every number in the
scoring code is a starting point. The honest way to set them is an
**impossible-pairs** calibration: take pairs where collusion is physically impossible
(different schools, different cities, different months), run the full pipeline over a
few thousand of them, and every score produced is a false positive *by construction*.
That yields statements like "a score of 85 occurs in 0.3% of impossible pairs" —
measured, not hoped. This has **not been done yet**, and should be repeated per
school, since a school with uniform tablets and issued notebooks has a completely
different baseline from one where students use their own phones.

### Honest expectations

| Scenario | Caught? |
|---|---|
| Same image uploaded twice | Reliably |
| Two photos, same sitting, home setting | Usually |
| Two photos, same sitting, inside a uniform classroom | Weakly — the shared baseline swamps the signal |
| Separate sittings, same shared notebook | No, and it *should not* |
| Answers copied by hand at home, alone | No — nothing physical links the photos |
| Anything on the PDF-rasterised upload path | Currently weak — see §4 |

Value therefore depends heavily on **where students actually photograph their
homework**, which can be determined from the images themselves.

### Current status, stated plainly
The pipeline runs end-to-end on real data and its suppression machinery
demonstrably works — it independently discovered three dead clues without being told.
But on the upload path we tested, the clues that survive are mostly
low-information ones, and we do not yet know whether the high-information detectors
(fold, stain) are correctly reporting rarity or simply failing to see. **That
question should be answered before anyone builds a reviewer UI on top of this.**

### Running it

```bash
# 1. fetch a task's submissions (needs .env with APP_MONGO_URL + OPS_MONGO_URL)
cd scripts/get_task_worksheets
pip3 install -r requirements.txt
python3 fetch_task_worksheets.py <task_id>

# 2. run the linking pipeline over them
cd ../../submission_linking/pipeline
pip3 install -r requirements.txt
python3 main.py ../../scripts/get_task_worksheets/output/<task_id>_submissions.json <task_id>
```

`.env`, `cache/` and `output/` are gitignored. Features are cached by url, so reruns
re-score without re-downloading.

### Where things live

| Path | What |
|---|---|
| [`goal.md`](goal.md) | The two problems, inputs, non-goals, blind spots |
| [`submission_linking/README.md`](submission_linking/README.md) | Problem 2 design + both probe results in full |
| [`submission_linking/pipeline/`](submission_linking/pipeline/) | The implementation |
| [`writer_identification/README.md`](writer_identification/README.md) | Problem 1 — design only, not built |
| [`scripts/get_image_info/`](scripts/get_image_info/) | Fetch worksheets by `journey_id` |
| [`scripts/get_task_worksheets/`](scripts/get_task_worksheets/) | Fetch worksheets by `task_id` (chains app_mongo → ops_mongo) |

### Pipeline module map

| Module | Responsibility |
|---|---|
| `features.py` | Per-image extraction, one function per clue. OpenCV + numpy, no ML |
| `s3_timing.py` | Clue 7 via S3 HEAD request |
| `scoring.py` | Two feature sets → the six named signals, raw distances preserved |
| `suppression.py` | Per-task fire-rate measurement → which clues to disable |
| `classify.py` | Rule-based (never averaged) → `link_type` + score |
| `grouping.py` | Union-find to collapse linked pairs into groups |
| `main.py` | Orchestration, caching, aggregation, report writing |

### One subtlety worth mentioning
Students submit **multi-page** homework, which breaks the clean pair arithmetic: 3
pages each across 10 students gives 30 images and 435 *image*-pairs — but still only
45 *student*-pair verdicts. The pipeline compares all cross-student image pairs, then
aggregates to a student-pair verdict by taking the **max** score across their page
pairs. Same-student pairs are skipped entirely — that's Problem 1's territory, not
Problem 2's.
