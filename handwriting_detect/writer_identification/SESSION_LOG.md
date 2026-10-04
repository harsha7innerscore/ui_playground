# Problem 1 (Writer Identification) — Session Log

> Purpose of this document: a complete, chronological record of one working
> session on Problem 1, written so a *different* chat/session can pick this up
> cold — what was decided, what broke, how it was fixed, what the numbers mean,
> and exactly what is still open. Everything here is reproducible from code
> already committed; this doc is the narrative that code alone doesn't carry.
>
> Companion docs: [`README.md`](README.md) (original design),
> [`case1_identification.md`](case1_identification.md),
> [`case2_verification.md`](case2_verification.md),
> [`probe/FINDINGS.md`](probe/FINDINGS.md) (viability probe results).
> Pipeline code: [`pipeline/`](pipeline/).

---

## 0. Where this picks up from

Problem 2 (submission linking — paper/lighting/camera matching, no
handwriting) was already built and run on real data before this session
started. Problem 1 (whose handwriting is this) was a design doc only
(`README.md`). This session's job: turn that design into working, tested code.

---

## 1. The two questions, split into two cases, up front

Before any building, Problem 1 was split into two independently useful
questions, because they have different inputs and different difficulty:

- **Case 1 — identification.** "Which student wrote this page?" Needs a
  student's past history (4+ worksheets, 3+ dates) to build a reference
  signature. Easier in principle — averaging several past pages cancels noise.
  Spec: [`case1_identification.md`](case1_identification.md).
- **Case 2 — verification.** "Did these two pages come from the same hand?"
  No history needed, works on a first submission, but it's the noisiest
  possible comparison (one page vs one page, nothing to average). Spec:
  [`case2_verification.md`](case2_verification.md).

Both share one fingerprint extractor and one go/no-go gate (below). Neither
case's actual scoring/matching/output code has been built yet — everything in
this session is groundwork to validate the fingerprint before building either
case on top of it.

**Key clarification given mid-session:** the two cases are not "pick one."
Case 1 answers "whose handwriting is this" (needs history, closed-set ranking
among known students). Case 2 answers "do these two match" (no history,
pairwise). A system that catches "C submitted A's paper" needs Case 1; a
system that catches "two different kids' pages came from one sitting/pen"
needs Case 2. The project wants both.

---

## 2. Why a gate before building either case

Both cases rest on one unverified assumption: that the numeric "fingerprint"
extracted from a page actually measures *handwriting*, not something
incidental like paper texture, scan quality, or lighting. If that assumption
is false, both cases fail silently — they'd produce confident, wrong verdicts
with no visible error, because the output always *looks* like a normal
verdict either way.

This matters more than usual here because Problem 2 already proved this exact
failure mode is real on this data: three of its seven clues (camera geometry,
encoder fingerprint, most of lighting) turned out to be completely dead on the
PDF-rasterised upload path, discovered only by measuring, not by assuming.

**The gate, concretely:** build four groups of page-pairs, measure "how
different" within each group, and check the ordering makes sense:

| Bucket | What it is | Expected if fingerprint is real |
|---|---|---|
| `same_sitting` | same student, same worksheet | most similar (proves little alone — shared paper/scan could explain this even with zero handwriting signal) |
| `same_student_diff_day` | same student, different worksheet, different date | **the row that matters** — must stay close to same_sitting |
| `diff_student_same_content` | different students, same (subject, topic, date) — i.e. the whole class did the identical worksheet | free bonus control — if this scores as tight as same_student_diff_day, the fingerprint is reading the worksheet, not the hand |
| `diff_student_general` | different students, unrestricted | baseline, least similar |

The `diff_student_same_content` bucket was not in the original design doc — it
was added when we noticed, by inspecting fetched data, that all 11 students in
our sample did identical worksheets on the same days. That's a free confound
check most teams wouldn't have without this specific data shape, and it ended
up being the single most important diagnostic in this whole session.

---

## 3. Data fetched

### 3a. Task-scoped (already existed before this session)
`scripts/get_task_worksheets/` — one task, 11 students, one worksheet each.
Wrong shape for Case 1 (needs history per student, not one snapshot).

### 3b. Student-scoped history (built this session)
`scripts/get_student_history/fetch_student_history.py` — new script. Queries
`ai-tutor.ocr-worksheet-details` by `user_id` (not by journey/task), sorted
`created_at` descending, for each of the 11 student IDs already known from
3a.

First run: `--limit 6` → 6 worksheets/student, 3 distinct dates each, 695
answer crops, 154 pages. All 11/11 students cleared the gate's minimum bar
(4+ worksheets, 3+ dates).

Second run, later in the session (more data requested): `--limit 20` → 11-15
worksheets/student, 6-9 distinct dates each (some from June/July, much wider
spread), 319 pages total.

Outputs: `student_history.json` (raw docs, grouped by student),
`student_history_pages.json` (flat per-worksheet records).

**Finding from inspecting the raw docs:** `(subject_id, topic_name_id, date)`
groups students into small clusters who did one identical worksheet that day
— verified directly against the data before relying on it as the confound
bucket's key. Example: on 2026-09-21, 3 students all have
`(subject_id=7738512, topic_name_id=9456907)`.

---

## 4. Viability probe — is there enough detail to even try this?

Before writing any fingerprint code: `probe/viability_probe.py`. Full write-up
in [`probe/FINDINGS.md`](probe/FINDINGS.md); summary here.

**Why this was run first:** Problem 2's write-up noted images come through a
96 DPI PDF-rasterisation path that already killed 3 of its 7 clues. Same risk
could apply to handwriting stroke detail.

**Method:** downloaded 30 full pages + 30 answer crops, measured stroke width
two independent ways (both from the distance transform — see code comments
for the derivation), ink coverage, image size.

**Result: PASS, and better than expected.**
- Stroke width 6-8px (two estimators agreeing), well clear of the 4px
  "no letterform left" floor.
- The "96 DPI" tag in `PROJECT_SUMMARY.md` turned out to be a JPEG header
  value, not actual detail — pages are ~250 DPI effective, 5.7MP.
- **No printed worksheet text on the pages at all** — inspected actual sample
  images directly rather than inferring from statistics. Students write on
  plain ruled notebook paper; no shared printed font to inflate similarity
  between students.

**Also found, not fatal but noted for later:** three contaminants reaching the
ink mask that aren't handwriting — notebook ruling lines, reverse-side
bleed-through, and (on full pages) spiral binding/page edges. These became the
first real bug, below.

**A dropped estimator, worth recording as a lesson:** an early stroke-width
estimator (area/perimeter ratio) gave nonsense values (~78px median next to a
~8px median from a second estimator) because filled regions — printed text
blocks, table rules, dark page edges — have far more area per unit perimeter
than a pen line. Caught by requiring two independent estimators to agree
before trusting either. Replaced with two distance-transform-based estimators
that did agree.

---

## 5. Building the pipeline

Directory: `pipeline/`, mirroring Problem 2's pipeline conventions
(`features.py`, caching by URL hash, `output/` + `cache/` gitignored).

- `features.py` — per-image fingerprint extraction (see §6-7 for what's in it
  and how it evolved).
- `fetch.py` — download-once-cache-forever, same pattern as Problem 2:
  raw image bytes cached by `md5(url)`, computed fingerprint cached
  separately so a rerun with nothing new costs zero network calls.
- `gate.py` — builds the four buckets, standardizes feature dimensions
  (z-score, NaN-safe), computes distances, summarizes, and applies a
  pass/fail rule.
- `main.py` — orchestration: loads student history, fingerprints every page,
  runs the gate at two granularities (page-level = Case 2's granularity, and
  worksheet-level averaged = Case 1's granularity), writes `gate_report.json`.
- `diagnose_features.py` — per-feature breakdown: does *any single* feature
  separate same-student-different-day from different-students, tested in
  isolation. Built specifically to answer "is the whole vector broken, or are
  a few good features being drowned out by noisy ones."
- `auc_check.py` — Mann-Whitney AUC between buckets (0.5 = no signal, 1.0 =
  perfect). Built because the bucket pass/fail rule turned out to be too
  blunt (all-or-nothing separation) to see partial, real improvement.
- `signature_test.py` — the actual acceptance test: leave-one-out, build each
  student's signature from their *other* worksheets, check whether a held-out
  worksheet gets matched to the right student among all enrolled students.
  This is literally Case 1's mechanism, run as validation.

**Input decision, changed mid-session on explicit direction:** originally
used `answer_crops` (pre-segmented per-answer images with printed text
excluded upstream) as the primary input, reasoning that there were 4.5x more
of them and each was guaranteed answer content. Switched to full pages
(`image_urls`) on direct instruction, since the viability probe had already
found there's no printed text to exclude on these pages anyway — crops bought
nothing at the cost of more moving parts (segment parsing, far more and much
smaller images, more size variance).

---

## 6. Challenge #1 — zero signal, diagnosed and fixed

### Symptom
First full gate run (crop-level, 695 crops): all four buckets landed within
6.4–7.4 of each other, no usable ordering. `diagnose_features.py` run on the
same data: **0 of 29 features** separated same-student-different-day from
random strangers — several were pointing the *wrong* direction entirely.

### Why this was distrusted rather than accepted
Sample pages were pulled up and inspected directly. They looked visibly
different writer-to-writer (slant, letter size, pressure) to the human eye.
A feature set that finds literally nothing on data where a human sees an
obvious difference is a red flag for a bug, not evidence the approach is
dead — so the result was investigated before being accepted.

### Root cause
`features.ink_mask`'s ruled-line removal was broken. It used a morphological
opening with a kernel as long as `width/3` pixels — this only removes a shape
if there's an *unbroken* run of ink at least that long, because erosion
requires every pixel in the kernel's footprint to be foreground. A real
scanned ruling line is not pixel-perfect continuous (anti-aliasing, JPEG
blocking introduce tiny gaps), so the opening found no qualifying run
anywhere and silently removed nothing. Confirmed by rendering the actual mask
for a real crop and visually finding the ruled lines still present in the
output.

This mattered more than a cosmetic glitch: **every student's notebook shares
the same ruling**, so the leaked lines were injecting an identical,
non-discriminative signal into every single fingerprint, and specifically
biasing the orientation histogram toward horizontal regardless of who wrote
the page — which is exactly consistent with `orientation_hist_0` (the
horizontal bin) being the largest bin for every sample checked.

### Fix
Replaced the morphological-opening approach with `cv2.HoughLinesP`, which
tolerates small gaps (same tool Problem 2 already uses for its fold-detection
clue). Lines within 5° of horizontal, spanning at least half the image width,
get drawn over with a small thickness buffer.

Hit a second, smaller bug applying this fix: `lines[:, 0]` on the
`HoughLinesP` output raised `TypeError: cannot unpack non-iterable
numpy.int32 object` — the same shape-unpacking issue Problem 2's fold
detection hit before (`PROJECT_SUMMARY.md` Issue 5, fixed there with
`np.ravel`). Fixed here with `lines.reshape(-1, 4)`.

### Verified fix worked
Re-rendered the mask for the same real crop: ruled lines gone, text strokes
intact (cross-bars on "t" survived — the fix isn't over-aggressive). Re-ran
the gate: bucket medians now ordered correctly (6.1 / 7.1 / 7.3 instead of
6.4 / 6.9 / 7.1, previously all bunched together), and all 29 individual
features pointed the right direction (several had been reversed before).
Real, measured improvement — not a cosmetic change.

**Lesson for future sessions:** a feature-removal step that "does nothing
detectable" can fail that way silently — it doesn't throw, it doesn't log
anything odd, the pipeline just runs to completion with the contaminant still
present. The only way this was caught was by rendering and looking at the
actual mask output on a real image, not by trusting the code's intent.

---

## 7. Challenge #2 — the content confound (not yet fully resolved)

### Symptom
Even after the ruled-line fix, the gate still failed its strict pass rule.
Specifically: `same_student_diff_day` separated fine from
`diff_student_general` (random strangers), but **not** from
`diff_student_same_content` (different students, identical worksheet). The
bonus-control bucket added in §2 caught exactly what it was designed to
catch.

### What this means in plain terms
Some of what the fingerprint was calling "a match" was really "these two
wrote the same answer," not "these two were written by the same hand." Two
students solving the identical worksheet — especially short, constrained
answers — produce component-level shape statistics (letter solidity, aspect
ratio, per-letter orientation) that are tied to *which letters were written*,
not purely to *who wrote them*.

### Research done before attempting a fix
Rather than guessing at a fix, this was researched: the field has a name for
exactly this failure — "text-dependent" vs "text-independent" writer
identification. Text-dependent approaches break on unfamiliar content; every
practical system aims for text-independent.

**The standard real-world answer: the Hinge feature** (Bulacu & Schomaker).
Instead of measuring whole letters/components (few per page, each tied to
exactly what was written), walk every point along the ink's contour and, at
each point, look a fixed distance (a "leg," ~7px) forward and backward along
the same contour. Record the pair of directions those two legs point in. Over
an entire page this produces thousands of (angle, angle) pairs — one per
contour point — binned into one joint histogram.

**Why this is supposed to fix the content problem:** a single digit or short
word contributes only a handful of points to a histogram built from
thousands. What survives at that scale is the population statistic of how
sharply this particular writer bends a pen stroke — not the identity of any
letter used to produce it. This is also literally what the project's own
original design doc (`README.md`) meant by "classic route — local
descriptors aggregated into a fixed-length vector" — the component-level
features built first were a cruder stand-in for this; Hinge is the real
version of that idea.

Also confirmed independently: published benchmarks (IAM, CVL) validate
writer-ID methods by testing on text the writer never used in training —
exactly the shape of the `same_student_diff_day` bucket already being used
here. The gate's design, built before this research, turned out to match the
field's actual standard validation protocol.

### What was built
`features.hinge_histogram()` — `leg_px=7`, `bins=12` (12×12 = 144-dim joint
histogram), vectorized with `np.bincount` per contour. Runs over
`cv2.RETR_LIST` contours (not `RETR_EXTERNAL`) so the inner contour of a loop
— the hole in an "o" or "a" — contributes its own hinge angles too, since loop
shape is exactly the kind of habit this feature means to capture.

This **replaced** the per-component shape stats (`solidity_mean/std`,
`aspect_ratio_mean/std`, `rel_area_mean/std`, the old per-component
`orientation_hist`) entirely, on the reasoning that those are specifically the
letter-identity-coupled features most likely to leak content. Kept alongside
it: `stroke_width_mean/ridge`, `ink_density`, `gap_mean/std` — these describe
pressure and spacing, not letter shape, so they carry their own
content-light signal rather than competing with Hinge.

Feature vector grew from 29 dims to 149 dims (5 scalars + 144 Hinge bins).

### Result after the swap — real improvement, not a clean fix
Three independent checks, run on the original 6-worksheet/student data:

| Check | Before Hinge | After Hinge |
|---|---|---|
| Bucket ordering | wrong/flat | correct |
| AUC(same_day vs diff_general) | not computed this way yet | **0.654** |
| AUC(same_day vs diff_same_content) — the confound check | ~chance (buckets nearly identical) | **0.608** |
| AUC(diff_same_content vs diff_general) — confound size alone | — | 0.553 |
| Leave-one-out top-1 ID accuracy (11 students) | — | **38.5%** (vs 9.1% random) |

Reading: real signal confirmed three independent ways. The confound shrank
and became smaller than the genuine writer-identity signal (0.553 < 0.654) —
better than before, where the confound and the signal were indistinguishable.
**Not a clean pass of the original gate**, and nowhere near published
clean-data systems (0.85-0.97 range) — but a measurable, non-random
improvement, confirmed three different ways rather than on one favorable
metric.

**Why the AUC check was built at all:** the original gate's pass/fail rule
(`median below the other bucket's 25th percentile`) demands near-total
separation and turned out to be too blunt to register partial, real
improvement — it still said FAIL even where every individual feature and the
leave-one-out accuracy showed clear, consistent gains. AUC (0.5 = coin flip,
1.0 = perfect) was added specifically to get a continuous, honest read instead
of a brittle binary one.

### More data tried — result was mixed, not a clean win
On direct instruction, pulled more history per student (`--limit 20`):
11-15 worksheets/student instead of 6, spanning 6-9 distinct dates instead of
3 (some back to June/July). Re-ran all three checks.

| Metric | 6 worksheets/student | 11-15 worksheets/student |
|---|---|---|
| Top-1 ID accuracy | 38.5% | **40.8%** (slight improvement) |
| AUC(same_day vs diff_general) | 0.654 | 0.605 (down) |
| AUC(same_day vs diff_same_content) | 0.608 | **0.511** (down to ~chance) |
| AUC(diff_same_content vs diff_general) | 0.553 | 0.601 (up) |

**This was reported honestly as a mixed result, not spun as a win.** The
headline practical number (identification accuracy) improved marginally. But
the specific confound diagnostic got *worse*: pulling in worksheets from a
wider date range apparently surfaced a stronger shared-content effect (more
clusters, possibly bigger ones), and the writer-identity signal no longer
reliably beat it in pairwise terms. More data did not resolve Challenge #2 on
its own.

### Status: open
Three options were laid out, not yet decided:
1. Accept ~40% as the classic-feature baseline, build Case 1/2 scoring with
   that accuracy explicitly surfaced in the output's confidence number.
2. Directly engineer around the confound: in real scoring, exclude or
   down-weight any candidate match against a student who shares a worksheet
   with the page being checked — a targeted, cheap mitigation for the
   specific failure mode found, independent of feature quality.
3. Escalate to the pretrained writer-ID model (Tier 2 in the original design
   doc) — classic features have now been given a fair shot, including more
   data, and plateaued around 40%.

**This decision was not made in this session.** Whoever picks this up next
should make this call explicitly before writing more scoring code, not
default into option 1 by momentum.

---

## 8. What each diagnostic number actually means, for a reader who wasn't here

This came up mid-session as a real point of confusion and is worth restating
plainly for the next reader too:

- **Median** of a bucket: sort all the distance numbers in that bucket,
  take the middle one. "Typical" distance for that kind of pair, robust to a
  few outliers.
- **AUC** between two buckets: the probability that a randomly picked pair
  from bucket A scores more similar (lower distance) than a randomly picked
  pair from bucket B. 0.5 = no better than a coin flip. 1.0 = perfect
  separation, every A-pair beats every B-pair.
- **Leave-one-out top-1 identification accuracy**: hide one worksheet, build
  every student's signature from everyone's *other* worksheets (including the
  true owner's), ask the system to pick the nearest of all 11 signatures to
  the held-out page, check if it picked right. Repeat for every worksheet.
  Count correct / total. This is **Case 1's exact real-world mechanism**,
  run as a test — not an abstract statistic, the literal thing the system
  would do in production.
- **Case 1 vs Case 2, re: these numbers:** the bucket/AUC checks are pairwise
  (page vs page) — that's Case 2's mechanism. `signature_test.py` is
  signature-vs-candidates — that's Case 1's mechanism. Both cases ride on the
  same underlying fingerprint and inherit the same weaknesses, including the
  content confound.

---

## 9. Current file inventory

```
writer_identification/
  README.md                       overview + pointer table (updated this session)
  case1_identification.md         Case 1 spec (written this session)
  case2_verification.md           Case 2 spec (written this session)
  SESSION_LOG.md                  this document
  probe/
    viability_probe.py            stroke-width / ink / resolution measurement
    FINDINGS.md                   probe results, PASS verdict + caveats
    requirements.txt, .gitignore
  pipeline/
    features.py                   fingerprint extraction (ink mask, line removal, Hinge, stroke width, etc.)
    fetch.py                      cached download (images + computed fingerprints)
    gate.py                       four-bucket construction, standardization, distance, pass/fail rule
    main.py                       orchestration: load history -> fingerprint -> gate at two granularities
    diagnose_features.py          per-feature separation breakdown
    auc_check.py                  Mann-Whitney AUC between buckets
    signature_test.py             leave-one-out identification accuracy (the real acceptance test)
    requirements.txt, .gitignore
    cache/, output/               gitignored

scripts/get_student_history/
  fetch_student_history.py        student-scoped worksheet history fetch (built this session)
  requirements.txt, .gitignore, .env
```

All of the above is committed. Run order to reproduce from scratch:

```bash
# 1. student history (needs VPN + .env with OPS_MONGO_URL)
cd handwriting_detect/scripts/get_student_history
python3 fetch_student_history.py --limit 20

# 2. viability probe (optional re-check, already passed)
cd ../../writer_identification/probe
python3 viability_probe.py --sample 30

# 3. the gate
cd ../pipeline
python3 main.py

# 4. the real diagnostics
python3 diagnose_features.py
python3 auc_check.py
python3 signature_test.py
```

Everything downstream of step 1 runs entirely off cached data in
`pipeline/cache/` after the first run — no network needed to iterate on
`features.py` or re-run any of the checks.

---

## 10. What is explicitly NOT done yet

- **No Case 1 scoring/output code.** No `OK`/`MISMATCH`/`UNKNOWN_WRITER`/
  `INSUFFICIENT_HISTORY` classification, no confidence score, no "looks like
  student X" attribution output. `signature_test.py` proves the *mechanism*
  works at ~40% accuracy; it does not produce the actual per-page JSON record
  described in `case1_identification.md`.
- **No Case 2 scoring/output code.** No pairwise verdict, no threshold, no
  "why" explanation list. The AUC checks prove there's *some* signal in the
  pairwise distance; nothing turns that distance into a same-hand/different-
  hand decision yet.
- **No threshold calibration.** Every number produced so far is diagnostic
  (does signal exist, how strong), not a decision threshold a real system
  would use.
- **The content confound is not resolved**, only characterized. See §7's
  three open options.
- **No testing on the PDF-rasterised-path vs other upload paths distinction**
  that mattered so much for Problem 2 — this session's data all came from one
  upload path; whether the fingerprint behaves differently on a direct-photo
  upload is untested.
- **Open-set evaluation not done.** `signature_test.py` is closed-set (the
  true writer is guaranteed to be one of the 11 enrolled students) per
  `case1_identification.md`'s own stated caveat — real use is open-set (the
  writer might be nobody enrolled), which is harder and would score lower.
  Closed-set accuracy should not be quoted as the system's real accuracy.
- **Habitual-offender detection** (per-student bimodality check, from the
  original design doc's known limits) — not started.

---

## 11. Suggested next step for whoever picks this up

Make the §7 decision first (accept ~40% baseline / engineer around the
confound / escalate to pretrained model) — everything else downstream
(scoring code, thresholds, output format) depends on which fingerprint is
actually being shipped. Don't write Case 1/2 scoring code before that's
decided, or it'll need rewriting once the fingerprint changes again.
