# Problem 1 (Writer Identification) — Session Log 2

> Continues [`SESSION_LOG.md`](SESSION_LOG.md). Written so a different session
> can pick this up cold: what was decided, what was measured, what broke, what
> is still open, and which numbers are safe to quote.
>
> Companions: [`approaches.md`](approaches.md) (literature survey),
> [`improvements.md`](improvements.md) (the backlog),
> [`case1_identification.md`](case1_identification.md),
> [`case2_verification.md`](case2_verification.md).

---

## Headline

**The number to quote: 85.3% top-1, 91.6% top-2, in the deployment
configuration** — ranking a page against the students actually assigned that
worksheet (median cohort 16, random 11.8%, lift 7.2×). See §12.

Across the whole 105-student roster, which is a harder but less realistic
task: 67.9% top-1 (69.0% with content-blind signatures), random 0.95%,
lift ~72×.

| | Session 1 end | Session 2 end |
|---|---|---|
| Top-1, full roster | 40.8% | **69.0%** |
| Candidate pool | 11 students | **105 students** |
| Random baseline | 9.1% | **0.95%** |
| Lift over random | 4.5× | **~72×** |
| Worksheets | 142 | 1283 |
| Pages fingerprinted | 319 | 3676 |
| **Top-1, deployment cohort** | not measured | **85.3%** |

Accuracy more than doubled **and** the candidate pool got ~10× harder.

**Note on §7 below:** it records a content-confound alarm that later turned out
to be overstated. §12 is the correction and supersedes it. §7 is kept because
the decomposition in it is sound and still the best map of what leaks where —
only the conclusion drawn from it was wrong.

---

## 1. Where this picked up

Session 1 left Problem 1 as groundwork only: a Hinge-based fingerprint, a
four-bucket gate reporting FAIL, 40.8% leave-one-out top-1 on 11 students, and
an explicitly deferred decision between (a) accept ~40%, (b) engineer around
the content confound, (c) escalate to a pretrained model.

No Case 1 or Case 2 scoring code existed. Still doesn't — this session was
about making the fingerprint good enough to be worth building scoring on.

---

## 2. Decision: Case 1 first, and why

Asked directly whether Case 2 was viable with what we had. Answer was no, with
numbers:

- Every AUC we had (0.605–0.654) was measured at **worksheet** level, after
  averaging a student's pages. Case 2's unit is page-vs-page, which is noisier,
  and the page-level gate report showed near-total overlap
  (same_student_diff_day median 8.33 vs diff_student_general 9.82).
- At that separation, a 30-student batch (435 pairs, maybe one real match)
  needs a false-positive rate in the tens of percent to catch the real pair.
  No threshold makes that useful. Not a tuning problem.
- Case 1 is structurally easier: it averages many pages into a signature and
  only has to **rank** candidates, not clear an absolute threshold.

### The Case-1-subsumes-Case-2 question

Raised mid-session: if Case 1 names the writer, and the name ≠ the submitter,
isn't that the whole product? **Largely yes** — Case 2 is not needed for the
headline scenario.

**But the hard part of Case 2 does not disappear, it relocates.** Case 1 needs
two decisions, not one:

1. **Who is nearest?** — ranking. Easy. The 67.1% measures only this.
2. **Is the nearest close enough to name at all?** — an absolute threshold.
   That is Case 2's question in different clothing.

Everything measured so far is **closed-set**: the true writer is always among
the candidates. Real submissions include pages written by a parent, sibling or
tutor who is in no candidate list. A pure ranker always returns a name, so
open-set deployment would confidently accuse a specific, innocent, named child.
**Open-set thresholding is Case 1 step 2 and is not optional.**

Two coverage gaps Case 1 also does not close:
- **New students** (under ~4 worksheets) → `INSUFFICIENT_HISTORY`. Case 2 works
  from a first submission.
- **Habitual offenders**: if C always submits A's work, C's signature *becomes*
  A's handwriting and Case 1 says OK forever.

---

## 3. Data expansion

### 3a. "Pull 30 or 50 worksheets per student" — turned out impossible
`--limit 50` returned **identical counts** to `--limit 20` (11–15 worksheets
each). The limit was never binding; those 11 students were exhausted. The
ceiling was 15, not a parameter.

### 3b. The real lever was more *students*
Surveyed the collection directly:
- `ai-tutor.ocr-worksheet-details`: 25629 docs, **3157 distinct students**.
- Filtering to students with real page images: **703 students with ≥6
  page-bearing worksheets across ≥3 dates, ~27k pages.**

We had been working on ~1% of available data.

**Trap found and avoided:** worksheet count and page count diverge sharply.
Students exist with **200 worksheets and 3 pages**. Selecting by worksheet count
picks students who cannot be fingerprinted at all. All cohort selection filters
on `image_urls` being non-empty.

Also: `school_id` does not exist on this collection (empty for all 703), so
school attribution needs a join elsewhere. Deferred by instruction.

### 3c. Cohort built
New `--recent-records N` mode on `fetch_student_history.py`: take the distinct
students in the N most recent worksheets, pull each one's full history
(`--limit 0`).

Probe first, because the requested recipe was too narrow:

| Records | Unique users | With page images |
|---|---|---|
| 100 | 26 | 14 |
| 300 | 85 | 52 |
| **1000** | **249** | **181** |
| 3000 | 618 | 534 |

Used 1000 → **181 students, 3493 worksheets, 8171 pages**, 154 meeting the gate
bar. Span 2026-09-26 to 2026-10-04.

### 3d. Prefetch, and stopping it early
8171 pages serially is ~4 hours (network round trip + Hough/contour work on
~5.7MP images), repeated on every script's first run. Added `prefetch.py`:
same per-URL work across a process pool, writing to the same `md5(url)` cache
the analysis scripts already read. Pure accelerator — removing it changes no
result.

Throughput started at ~159/min, fell to ~44/min (likely S3-side). **Stopped by
instruction at 4047 fingerprints**, giving:

- 4047 fingerprints on disk, **3676 usable**, 52 empty (no ink)
- **105 students** with ≥1 usable page, 87 with ≥4
- 2.6 GB image cache

**Sampling caveat to carry forward:** the fetch walked students in order, so the
76 missing students are the tail of the list, not a random sample. Fine for
comparing metrics against each other; not a random draw for external quoting.

The cache is permanent and resumable — `prefetch.py` picks up exactly where it
stopped and re-downloads nothing.

---

## 4. Literature survey → [`approaches.md`](approaches.md)

Six tiers, ordered by cost. Three findings worth restating:

**"Just use a pretrained writer-ID model" is not actually available.**
`README.md` treats it as a drop-in upgrade. Public pretrained handwriting
models do transcription (TrOCR, CTC-HTR), generation (DiffusionPen), or
signature verification — different tasks. Writer-ID papers release results, not
weights. That escape hatch should come off the table.

**"No training required / no labelled examples needed" was being misread.** It
refers to labelled *cheating* examples, which genuinely don't exist. It had been
read as "we cannot train anything." Wrong: every page carries the submitter's
`user_id`, and that is exactly the label writer-ID models train on. Caveat: the
label is *submitter*, not writer, so any cheating already in history is label
noise.

**Published 81–99% numbers are not our target.** Those come from clean flatbed
scans of long prepared paragraphs; ours are short homework answers on ruled
notebook paper via PDF rasterisation. Text quantity is the dominant driver in
this literature (reported 20–30% drop at one text line, holding above 90% of
page-level accuracy from ~four lines up). The honest target is "better than our
own last number, measured the same way."

---

## 5. The Tier 0 fix — the main result of this session

### 5a. The hypothesis, and it was wrong

Predicted: 144 of our 149 dimensions are a joint probability histogram (Hinge),
but `gate.py` z-scores every dimension and takes plain Euclidean. Z-scoring
divides each bin by its own standard deviation, amplifying near-empty noisy
bins to the weight of informative ones. The literature uses chi-square on the
raw histogram. Expected chi-square to win.

**Measured, on the 11-student data:**

| Metric | top-1 |
|---|---|
| BASELINE (z-score all + Euclidean) | **40.8%** |
| Hellinger | 38.7% |
| chi2 | 37.3% |
| Bhattacharyya | 37.3% |
| Manhattan | 31.0% |
| cosine | 23.9% |
| raw Euclidean | 19.0% |

The prediction lost. Measuring instead of assuming is what prevented shipping it.

### 5b. What the numbers actually pointed at

Z-scoring a histogram does **two** things at once. It flattens distribution
shape — the damage the argument predicted — but it is also **diagonal
whitening**, and decorrelation is one of the larger documented gains in
VLAD/Fisher-vector writer-ID pipelines. The whitening was worth more than the
shape damage cost.

That implied the recipe those pipelines actually use, which is **neither** thing
tested: **power-normalize (sqrt) → L2-normalize → whiten**, applied in order.
Square root stabilizes count-data variance so no handful of bins dominates;
whitening then decorrelates.

### 5c. Result

| Transform | top-1 (11 students) |
|---|---|
| **sqrt+l2+pca64** | **78.2%** |
| pca | 76.1% |
| sqrt+pca | 72.5% |
| sqrt+zscore | 44.4% |
| BASELINE | 40.8% |
| raw | 18.3% |

**40.8% → 78.2%, top-5 73.9% → 96.5%, median rank 2 → 1.** Same images, same
features, scoring only.

### 5d. The leak check — not optional

PCA-whitening fit on 142 worksheets in 149 dimensions sits exactly in the regime
where trailing components are near-zero-variance noise directions that whitening
amplifies enormously. If the held-out worksheet took part in its own fit, it
would look far more separable than it is.

`evaluate.py --honest` refits the transform per query with the query excluded.
**Measured leak: −1.4%** (the honest number is *higher*). No inflation.

---

## 6. The 105-student re-baseline

| Metric | top-1 | top-5 | MRR | lift | AUCsig | AUCcon |
|---|---|---|---|---|---|---|
| **T:sqrt+pca** | **67.1%** | 81.9% | 0.741 | 70.4× | 0.630 | 0.432 |
| T:sqrt+l2+pca | 67.1% | 81.9% | 0.741 | 70.4× | 0.630 | 0.432 |
| T:sqrt+l2+pca64 | 65.0% | 81.6% | 0.727 | 68.3× | 0.639 | 0.441 |
| T:pca | 59.5% | 77.0% | 0.676 | 62.5× | 0.621 | 0.429 |
| T:sqrt+l2+pca32 | 52.7% | 75.8% | 0.632 | 55.4× | 0.654 | 0.436 |
| T:sqrt+zscore | 29.4% | 52.2% | 0.411 | 30.8× | 0.669 | 0.445 |
| BASELINE | 27.7% | 50.7% | 0.394 | 29.1× | 0.650 | 0.434 |
| T:raw | 6.1% | 23.4% | 0.159 | 6.4× | 0.646 | 0.415 |

Leak checks ±0.4% throughout.

**Raw top-1 fell (78.2% → 67.1%) while lift rose (8.6× → 70.4×).** That is the
pool-size effect, predicted before the run: random drops from 9.1% to 0.95%, so
the task is ~10× harder. Top-1 is **not comparable across pool sizes** — this is
why `evaluate.py` reports top-1, top-5, MRR and lift together.

**Full PCA now beats pca64**, where pca64 won at 11 students. More data supports
more retained dimensions. The dimension sweep (improvements.md A1) is worth doing
properly rather than on three points.

---

## 7. The open problem: the content confound reversed ← most important

`AUCcon` = P(a same-student-different-day pair is more similar than a
different-student-same-worksheet pair).

| | 11 students | 105 students |
|---|---|---|
| AUCcon | 0.505 (chance) | **0.432 (worse than chance)** |

Below 0.5 means: **two different students writing the same worksheet produce
more similar fingerprints than one student's own work on two different days.**
More data made this worse, not better.

### Why this matters more than the headline number

The 67.1% is measured across a student's **whole history**, where averaging
many worksheets across many dates washes content out.

**The deployment case is the exact opposite** — one class, one assigned
worksheet, every student writing the same answers. That is precisely the
configuration AUCcon says is confounded.

`improvements.md`'s own acceptance rule — *a change only counts as a win if it
does not worsen `auc_vs_content_confound`* — is **violated by our current best
metric**. The honest reading:

- Strong evidence the fingerprint carries real writer identity (70× lift).
- Strong evidence it is **not yet safe for the within-task comparison the
  product needs**.

This was flagged and left open by instruction; other improvements were not
started.

---

## 8. Code added this session

| File | What |
|---|---|
| `pipeline/metrics.py` | Both metric families: pairwise histogram distances (chi2, Hellinger, Bhattacharyya, L1, cosine, raw Euclidean) and corpus-fitted transforms (sqrt, L2, diagonal/PCA whitening). Kept side by side so this stays a measured comparison, not a replaced default. |
| `pipeline/evaluate.py` | The honest harness. Reports top-1, top-5, MRR, lift and both bucket AUCs together. `--honest` refits corpus-fitted transforms per query. |
| `pipeline/prefetch.py` | Parallel cache filler. Pure accelerator. |
| `approaches.md` | Literature survey, six tiers by cost. |
| `improvements.md` | The backlog, with the acceptance rule. |
| `scripts/.../fetch_student_history.py` | `--recent-records N`, `--limit 0`. |
| `pipeline/gate.py` | `build_buckets(distance_fn=...)` so two metrics compare on identical pairs. |
| `pipeline/main.py` | `load_items(cache_only=True)` — an analysis rerun must never silently become a download. |

### Two bugs/traps fixed, worth remembering

**`load_items` would silently re-download.** With a half-filled cache, every
evaluation would re-fetch 4495 pages one at a time. Now `cache_only=True` skips
uncached pages instead.

**`evaluate_transform_honest` was O(queries × worksheets) transforms** — fine at
142 worksheets, several million operations at 1283. Vectorized to one matrix
projection per query.

**A spurious RuntimeWarning from Apple's Accelerate BLAS**: `divide by zero
encountered in matmul`, raised even though every input and output is finite.
Verified against `np.einsum` and an explicit dot-product loop, agreeing to
4e-16. Suppressed **by message** so a genuine numerical problem elsewhere still
surfaces. Do not widen that filter.

---

## 9. What is explicitly NOT done

- **No Case 1 scoring/output code.** No `OK`/`MISMATCH`/`UNKNOWN_WRITER`/
  `INSUFFICIENT_HISTORY` verdicts, no confidence number, no attribution JSON.
  `evaluate.py` proves the mechanism at 67.1%; it does not produce the record
  `case1_identification.md` specifies.
- **No Case 2 code at all.**
- **No open-set evaluation.** Everything is closed-set. Real use is open-set and
  will score lower. **Closed-set accuracy must not be quoted as the system's
  accuracy.**
- **The content confound is unresolved and now measurably worse.**
- **No threshold calibration.** Every number so far is diagnostic.
- **Habitual-offender bimodality check** — not started.
- **Nothing from `improvements.md`** beyond the Tier 0 metric work.
- **~4124 pages unfetched** (76 of the 181 cohort students). Resumable.

---

## 10. Reproducing from here

```bash
cd handwriting_detect/writer_identification/pipeline
python3 evaluate.py --honest          # the 67.1% number, off cache, ~10 min
```

To extend the cache (needs network to the S3 image urls, no Mongo):
```bash
python3 prefetch.py --workers 10      # resumes, re-downloads nothing
```

To rebuild the cohort (needs VPN + .env with OPS_MONGO_URL):
```bash
cd ../../scripts/get_student_history
python3 fetch_student_history.py --recent-records 1000 --limit 0
```

---

## 11. Suggested next step

**Make the §7 call before writing scoring code.** The confound reversal means
the current best metric is strongest exactly where the product is weakest. Two
coherent orders:

1. **Confound first** — investigate why same-worksheet pairs match so well, fix
   or mitigate, then resume `improvements.md`. Slower, but avoids tuning a
   metric that is optimising the wrong thing.
2. **Backlog first** — work `improvements.md` group A (exemplar SVM, re-ranking,
   per-page voting), re-checking AUCcon each time, on the theory that something
   there fixes the confound as a side effect.

Either way: **do not build Case 1's verdict/output layer until AUCcon is
understood**, or it will encode a metric that fails in the deployment
configuration.


---

## 12. The confound, chased down — and the alarm partly retracted

§7 reported AUCcon at 0.432 (below chance) and concluded the fingerprint would
fail in the deployment configuration, where a whole class does one worksheet on
one day. That conclusion was **asserted from a pairwise number, never measured
on the deployment task**. Measured, it is wrong. Here is the full chase.

### 12a. First: attribute the confound before fixing it

`gate.py`'s `content_key` is `subject:topic:date`. Two students sharing it share
their *words* — but also their day, class, notebook and capture batch. Problem 2
established that shared-environment effects on this data are big enough to flood
every pair in a classroom at once. A fix for leaked content and a fix for leaked
paper have nothing in common, so the two had to be separated first.

The worksheet documents carry `questions[].question_id`, so content identity can
be stated **exactly** rather than proxied. That allows a four-way split
(`confound_diagnosis.py`):

| Pair type | median distance | AUC vs real writer match |
|---|---|---|
| Same writer, different day | 8.645 | — |
| Diff writer, **same questions**, diff day | 8.244 | **0.464** ← words alone |
| Diff writer, diff questions, **same day** | 8.412 | **0.485** ← day alone |
| Diff writer, diff questions, diff day | 10.506 | 0.612 (clean baseline) |

Writer identity buys 10.506 → 8.645. Content alone buys *more*. Same-day capture
buys about as much. **Both leaks are real, roughly equal, and compound to 0.397.**

This decomposition is the durable artifact of the session. It still stands.

### 12b. Attempt 1 — scale normalization. Worked mechanically, fixed nothing.

**Hypothesis.** `HINGE_LEG_PX` is a distance in *pixels*. Measured stroke width
spans 4.01–15.23px across our worksheets — nearly 4×. On a thin-pen page a 7px
leg crosses a whole letter; on a thick-pen page it barely leaves the stroke.
Same name, different measurement. Pages captured in one batch share a pen and a
resolution, hence a scale — a candidate mechanism for the day leak.

Supporting number: among pairs by **different** writers, correlation between
stroke-width difference and fingerprint distance was 0.428.

**Fix.** Resample every page to a 7px stroke before the histogram
(`features.normalize_stroke_scale`, `FEATURE_VERSION = 2`).

**It worked mechanically.** 76% of pages resampled, stroke-width spread cut 61%
(std 1.21 → 0.48), median landing at 6.87 against a 7.0 target.

**It changed nothing that mattered**, on the same 3728 pages:

| Control | v1 | v2 |
|---|---|---|
| same questions, same day | 0.397 | 0.400 |
| same questions, diff day | 0.464 | 0.468 |
| **diff questions, same day** ← target | **0.485** | **0.482** |
| diff questions, diff day | 0.612 | 0.607 |
| top-1 (`sqrt+pca`) | 66.7% | 67.4% |

**Verdict: implementation sound, hypothesis wrong.** Scale is not the mechanism.

**Where the reasoning went wrong, recorded so it is not repeated:** the 0.428
correlation was never clean evidence of leakage. Different writers genuinely
differ in pen thickness and writing size, so part of that correlation is the
signal we want. The AUC decomposition was the real test all along.

**Kept, not reverted.** Normalizing a pixel-denominated feature is correct
regardless, and all our data arrives by one upload path — a direct-photo path at
a different resolution would make a fixed-pixel leg actively wrong.

### 12c. Attempt 2 — content-blind signatures. Worked, and cost nothing.

**Correction to session 1's deferred option.** It was phrased as *"exclude or
down-weight any candidate who shares a worksheet with the page being checked."*
**That is wrong for the scenario the product exists to catch.** When C hands in
a paper A wrote, A sat the *same assigned worksheet*. Excluding same-worksheet
candidates removes the true writer from the candidate list.

The exclusion belongs one level down: keep every candidate, but build each
candidate's signature only from worksheets whose questions differ from the
query. A stays rankable; the evidence that ranks them can no longer be "these
two pages contain the same words."

| Signatures built from | full roster top-1 | deployment cohort top-1 |
|---|---|---|
| all worksheets | 67.9% | 82.9% |
| **content-disjoint only** | **69.0%** | **85.3%** |

Expected to cost accuracy by discarding reference material. It does not — it
helps slightly in both configurations. **Adopt it.**

### 12d. The correction: the deployment configuration is the *easier* task

§7 claimed the within-task case would collapse. `deployment_test.py` measures it
directly — query is one worksheet, candidates are only students assigned that
same worksheet, signatures content-blind:

| | Full roster | **Deployment cohort** |
|---|---|---|
| Candidates | 105 | median 16 (range 2–21) |
| Random baseline | 0.95% | 11.8% |
| **Top-1** | 69.0% | **85.3%** |
| Top-2 | — | **91.6%** |
| Lift | ~72× | 7.2× |
| Queries scored | 1255 | 956 |

**Why §7 was wrong:** the confound is real at the level it was measured — *page
versus page*. Case 1 does not score that way. It scores a page against a
signature averaged over many worksheets, and that averaging dilutes the shared
content. The pairwise AUC does not transfer to the ranking task. Two different
mechanisms; one number was treated as evidence about the other.

Note the two numbers are **not comparable**: 16 candidates is a far easier
ranking problem than 105, which is why lift falls while top-1 rises. Both are
honest for their own configuration, and the baseline must always be quoted
alongside.

### 12e. What this does *not* fix

**14.7% of genuine submissions still rank someone else first.** Flagging on a
top-1 mismatch alone would wrongly implicate roughly one honest student in seven.
That is the real blocker now — not the confound. It needs:

- a **confidence/margin layer** (how far ahead is the top match; a narrow margin
  is a coin flip and must be reported as one), and
- **open-set handling** — the writer may be a parent, sibling or tutor in no
  cohort at all, and a pure ranker always returns a name.

---

## 13. Scripts added in the confound work

| File | What |
|---|---|
| `pipeline/confound_diagnosis.py` | Four-way split of the confound using exact `question_id` sets. Separates "the words" from "the day". |
| `pipeline/content_blind_test.py` | Signatures built from content-disjoint worksheets only. |
| `pipeline/deployment_test.py` | **The number that matters.** Ranks within the real assigned-worksheet cohort, with the per-cohort random baseline. |
| `pipeline/identify.py` | Single-image inference — see §14. |

Two methodology guards added, both keepers:

- **`features.FEATURE_VERSION`**, used in the feature-cache path. Changing a
  feature while the cache keys on url alone silently blends old and new vectors.
  Both are well-formed float arrays, so the failure looks like noise, not an
  error.
- **`evaluate.restrict_to_shared_pages` / `main.URL_ALLOWLIST`.** `prefetch` had
  continued past the pages it owed, so v2 covered more pages than v1. Comparing
  across that would have measured a feature change and a data change together,
  inseparably.


---

## 14. Can it be used? — `identify.py`

```bash
cd pipeline
python3 identify.py <image-url-or-path>
python3 identify.py <image> --cohort <student_id> <student_id> ...   # the realistic setting
python3 identify.py <image> --submitted-by <student_id>              # reports where they ranked
python3 identify.py <image> --json
```

Takes one image, returns the enrolled students ranked by handwriting
similarity, with a confidence derived from the margin to the runner-up.

**Yes for:** ranked suggestions shown to a human who decides. "Of these
candidates, this page looks most like X, and here is how far ahead X sits."

**No for:** automated flagging, verdicts, or anything a student sees. Three
hard limits, all in the tool's own output:

1. **Closed-set.** Every score is relative to the candidates given. A page
   written by a parent, sibling or tutor still returns a ranked list of
   enrolled students, and the top entry is *wrong*, not absent. Open-set
   rejection is not implemented.
2. **14.7% of genuine submissions rank someone else first.** Flagging on a
   top-1 mismatch would wrongly implicate roughly one honest student in seven.
3. **No verdict layer.** `identify.py` deliberately emits no
   OK/MISMATCH/UNKNOWN_WRITER, because the threshold that would justify one has
   not been calibrated.

**Always pass `--cohort`** with the students actually assigned the worksheet.
That is the configuration the 85.3% was measured in. Against the full
105-student roster the number is 69.0%, and against candidates with no history
it cannot answer at all.

**One caveat on demonstrations:** if the image is already in a student's
fetched history, its own fingerprint is inside that student's signature and the
result flatters itself. The 85.3%/69.0% figures are leave-one-out and do not
have that problem; an ad-hoc run on a known page does.

### Before this could drive a flag

- **Open-set rejection** — an absolute "is the top match close enough to name
  at all" threshold. Without it the system accuses whoever is nearest.
- **Threshold calibration** on hand-reviewed results, per school.
- **A margin-aware confidence** that is validated, not just computed — the
  current one is a reasonable formula, not a calibrated probability.
