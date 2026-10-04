# Writer Identification — How It Works

> A complete technical account of Problem 1: what was built, how, what broke,
> where it stands, and what it cannot do.
>
> Narrative history: [`SESSION_LOG.md`](SESSION_LOG.md),
> [`SESSION_LOG_2.md`](SESSION_LOG_2.md).
> Specs: [`case1_identification.md`](case1_identification.md).
> Options not yet taken: [`approaches.md`](approaches.md),
> [`improvements.md`](improvements.md).

---

## 0. The one-paragraph version

Students hand in photos of handwritten homework. Sometimes the submitter did
not write the page. This system turns a page image into a 149-number
"fingerprint" describing *how* the writing was made — not what it says — then
compares that fingerprint against each student's own past work to say whose
handwriting it most resembles. On real data it names the correct student
**85.3% of the time** when ranking against the students actually assigned that
worksheet. **There is no trained model and no machine learning**; every number
is a direct measurement over pixels, plus one unsupervised rotation fitted on
our own unlabelled images.

---

## 1. What we did

| Stage | Outcome |
|---|---|
| Split Problem 1 into two cases | Case 1 (who wrote this, needs history) vs Case 2 (do these two match, no history). Chose Case 1 — Case 2 is the noisier problem and Case 1 subsumes the product scenario |
| Viability probe | Confirmed the images carry enough stroke detail to attempt this at all (6–8px strokes, ~250 DPI effective) |
| Built a fingerprint | Hinge histogram + 4 scalars, no ML |
| Built a go/no-go gate | Four buckets of page-pairs that detect whether the fingerprint tracks the hand or the paper |
| Expanded the data | 11 students → 105; 319 pages → 3676 |
| Fixed the comparison maths | 27.7% → 67.1% top-1, same images, same features |
| Chased the confound | Separated "same words" from "same capture day"; retracted an over-stated alarm |
| Built inference | `identify.py` — one image in, ranked students out |

**Not done:** verdicts, thresholds, open-set rejection, any reviewer UI, Case 2.

---

## 2. How the problem was solved

### 2.1 The core idea

Handwriting identity lives in *how a pen moves*, not in *what was written*. Two
pages by one person share curvature habits, stroke thickness and spacing even
when the words are completely different.

The field calls this **text-independent writer identification**. The standard
classical answer, and the one we use, is the **Hinge feature** (Bulacu &
Schomaker).

### 2.2 The Hinge feature, concretely

Walk every point along the outline of the ink. At each point, look a fixed
distance backward and forward **along the same outline** — two "legs" hinged at
that point. Record the pair of angles those legs point in.

A full page yields tens of thousands of such angle pairs. Bin them into a joint
12×12 histogram → **144 numbers** describing the population statistics of how
sharply this writer bends a stroke.

**Why this resists the content problem.** One letter contributes a handful of
points to a histogram built from thousands. What survives at that scale is a
habit, not a letterform. This matters because the first attempt used per-letter
shape statistics (solidity, aspect ratio, per-component orientation) and those
*are* tied to which letters were written — two students answering the same
question scored as similar regardless of handwriting. Hinge replaced them.

Implementation detail worth knowing: contours are traced with `cv2.RETR_LIST`,
not `RETR_EXTERNAL`, so the *inside* of a loop — the hole in an "o" or "a" —
contributes its own angles. Loop shape is exactly the kind of habit this is
meant to capture.

### 2.3 The full fingerprint — 149 numbers

| Block | Dims | What it measures |
|---|---|---|
| `hinge_histogram` | 144 | Curvature habits (above) |
| `stroke_width_mean`, `stroke_width_ridge` | 2 | Pen thickness, two independent distance-transform estimators |
| `ink_density` | 1 | How densely they pack ink inside their own writing's bounding box |
| `gap_mean`, `gap_std` | 2 | Spacing between letters and words |

Also recorded but not compared: `ink_px` (used as a refuse-to-score floor) and
`scale_applied`.

### 2.4 Getting to the ink first

Everything above needs ink separated from paper. `features.ink_mask` does:

1. **Adaptive threshold** (local) — survives uneven lighting across a page.
2. **AND Otsu** (global) — kills reverse-side bleed-through, which is real ink
   but reads lighter than the pen on this side.
3. **Ruled-line removal** via `HoughLinesP` — near-horizontal lines spanning
   half the page width get painted out.
4. **Speckle removal** — connected components below 6px dropped.

### 2.5 Comparing two fingerprints — where most of the accuracy came from

Not by comparing the 149 numbers directly. Three transforms are applied first,
fitted once over the whole corpus:

1. **Square root** every histogram bin. Variance stabilisation for count data —
   stops a few dominant bins monopolising the comparison.
2. **L2-normalise** to unit length.
3. **PCA-whiten.** Rotate into the directions along which pages actually differ,
   and divide each by its spread, so a direction carrying little real variation
   stops shouting as loudly as one carrying a lot.

Then plain Euclidean distance. **This chain roughly doubled accuracy on
identical input data** — see §4.4.

### 2.6 Scoring a page

```
signature(student) = mean of that student's past worksheet fingerprints
score(page, student) = euclidean( transform(page), signature(student) )
```

Rank candidates by that distance. Report the nearest, and the **margin to the
runner-up**, which is the actual confidence signal — absolute distance is not
interpretable (§6.2).

Two refinements that matter:

- **Leave-one-out.** When scoring a page already in a student's history, that
  student's signature is rebuilt without it. Otherwise the page is compared
  against a reference it helped create.
- **Content-blind signatures.** A candidate's signature excludes any worksheet
  posing the same questions as the query, so a match cannot come from "these two
  pages contain the same words". Worth **+2.4 points** (82.9% → 85.3%).

---

## 3. "The training" and "the model" — what actually exists

**This is the section most likely to be misunderstood, so it is blunt: there is
no trained model. No neural network, no classifier, no labelled training set,
no GPU, no loss function, no epochs.**

What exists instead:

| Thing | Fitted on | Supervised? | Cost |
|---|---|---|---|
| Hinge, stroke width, gaps, density | nothing — direct pixel measurement | no | ~0.5s/page CPU |
| PCA whitening rotation | our own unlabelled page fingerprints | **no** — it never sees who wrote what | seconds |
| Scalar z-scoring stats | same corpus | no | instant |
| Per-student signatures | that student's own past pages | arguably yes, trivially — it is an average | instant |

The PCA step is the only thing resembling "fitting", and it is **unsupervised**:
it looks at the spread of fingerprints and finds the directions of variation,
with no knowledge of student identity. Replace the corpus and it refits in
seconds.

### Why no model was trained

The design docs said "no training required, no labelled examples needed" — true,
and it means *no labelled examples of cheating*, which genuinely do not exist.
That got read as "nothing can be trained", which is wrong and worth correcting:
**every page carries the submitter's `user_id`, and that is exactly the label
writer-identification models train on.** 105 students / 3676 pages now, ~703
students / 27k pages available.

Training a metric-learning model on those labels is the single biggest
remaining lever (see §6.4). It was not done because the classical route had not
been exhausted, and it turned out to have a lot left in it — the whitening fix
alone more than doubled accuracy for an afternoon's work.

---

## 4. Issues encountered, and how each was fixed

Ordered chronologically. Each is a finding, not just a bug.

### 4.1 The ruled-line removal that silently did nothing

**Symptom.** First full run: all four gate buckets landed within 6.4–7.4 of each
other. `diagnose_features.py` reported **0 of 29 features** separating a
student's own work from strangers — several pointed the wrong way.

**Why it was distrusted rather than accepted.** Sample pages were pulled up and
looked at. They were *visibly* different writer-to-writer. A feature set finding
nothing where a human sees an obvious difference is a red flag for a bug, not
evidence the approach is dead.

**Root cause.** Ruled-line removal used a morphological opening with a kernel
`width/3` long. Erosion only removes a shape if there is an **unbroken** run of
ink at least that long. A scanned ruling line has tiny gaps from anti-aliasing
and JPEG blocking, so no qualifying run existed anywhere and the opening removed
**nothing** — without throwing, logging, or failing. The lines passed straight
into the ink mask.

**Why it mattered so much.** Every student's notebook has the same ruling. The
leaked lines injected an identical, non-discriminative signal into every
fingerprint and biased every orientation statistic toward horizontal.

**Fix.** `cv2.HoughLinesP`, which tolerates gaps. Verified by rendering the
actual mask: lines gone, cross-bars on "t" intact.

**Lesson.** A removal step that does nothing fails invisibly. The only thing
that caught it was rendering the mask and looking.

### 4.2 Letter-shape features encoded content, not writers

**Symptom.** After 4.1, a student's own work separated from random strangers but
**not** from different students who had done the same worksheet.

**Cause.** Per-component statistics (solidity, aspect ratio, per-letter
orientation) are tied to *which letters were written*. Same worksheet → same
letters → similar statistics regardless of who held the pen.

**Fix.** Replaced them with the Hinge histogram (§2.2). Top-1 went to 38.5% from
a 9.1% random baseline; the confound shrank below the genuine signal.

### 4.3 More data per student did not help

Pulling 11–15 worksheets per student instead of 6 moved top-1 only 38.5% → 40.8%
and made some confound diagnostics *worse*. Reported as a mixed result rather
than spun as a win.

Later discovery: **the limit was never binding.** `--limit 50` returned
identical counts to `--limit 20` — those 11 students were simply exhausted at 15
worksheets. The real lever was never worksheets-per-student.

### 4.4 The comparison maths was wrong — and the predicted fix was also wrong

**Prediction.** 144 of 149 dimensions are a probability histogram, but the code
z-scored every dimension and took Euclidean distance. Z-scoring divides each bin
by its standard deviation, which inflates near-empty noisy bins to the weight of
informative ones. The literature uses chi-square on the raw histogram, so
chi-square should win.

**Measured.** Chi-square **37.3%**, Hellinger **38.7%**, baseline **40.8%**. The
prediction lost. Measuring instead of assuming is what prevented shipping it.

**What the numbers actually said.** Z-scoring a histogram does *two* things:
it flattens distribution shape (the predicted damage) **and** it is diagonal
whitening. Whitening was worth more than the shape damage cost — which pointed
at the recipe neither test used: **sqrt → L2 → whiten**, in that order.

**Result:** 40.8% → **78.2%** on 11 students; 27.7% → **67.1%** on 105.

**Leak check, not optional.** PCA-whitening fit on 142 worksheets in 149
dimensions sits exactly where trailing components are noise that whitening
amplifies. If the held-out page joined its own fit it would look artificially
separable. `--honest` refits per query with the query excluded. Measured leak:
**±0.4%**. Real.

### 4.5 Worksheet count ≠ page count

Selecting students by worksheet count surfaced students with **200 worksheets
and 3 page images** — unusable. All cohort selection now filters on `image_urls`
being non-empty.

### 4.6 Scale normalisation — a clean negative result

**Hypothesis.** `HINGE_LEG_PX` is 7 *pixels*. Measured stroke widths span
4.01–15.23px. On a thin-pen page a 7px leg crosses a whole letter; on a
thick-pen page it barely leaves the stroke. Pages captured in one batch share a
pen and resolution, so they share a scale — a candidate cause of the same-day
confound. Supporting number: correlation 0.428 between stroke-width difference
and fingerprint distance among *different* writers.

**Fix.** Resample every page to a 7px stroke before the histogram.

**It worked mechanically.** 76% of pages resampled, stroke-width spread cut 61%,
median landing at 6.87 against a 7.0 target.

**It fixed nothing.** Day-leak AUC 0.485 → 0.482. Top-1 66.7% → 67.4%. All noise.

**Verdict: implementation sound, hypothesis wrong.** Kept anyway — normalising a
pixel-denominated feature is correct regardless, and a direct-photo upload path
at a different resolution would make a fixed-pixel leg actively wrong.

**Where the reasoning failed.** The 0.428 correlation was never clean evidence
of leakage. Different writers genuinely differ in pen thickness and writing
size, so much of that correlation is the signal we *want*. A suggestive number
was treated as a diagnosis.

### 4.7 The confound alarm that was overstated

**The alarm.** A control measuring "different students, same worksheet" came out
at 0.432 — below chance. Two different students doing the same worksheet looked
*more* alike than one student across two days. The conclusion drawn: the system
would collapse in deployment, where a whole class does one worksheet.

**The attribution work.** Before fixing it, it had to be attributed — the
control conflated *same words* with *same day, class, notebook and capture
batch*, and those need completely different fixes. Worksheet documents carry
`questions[].question_id`, so content identity could be stated exactly rather
than proxied:

| Pair type | median dist | AUC vs real writer match |
|---|---|---|
| Same writer, different day | 8.645 | — |
| Diff writer, **same questions**, diff day | 8.244 | **0.464** ← words |
| Diff writer, diff questions, **same day** | 8.412 | **0.485** ← day |
| Diff writer, diff questions, diff day | 10.506 | 0.612 (baseline) |

Both leak, roughly equally, and compound.

**The retraction.** The alarm was asserted from a *pairwise* number and never
measured on the deployment task. Measured:

| | Full roster | Deployment cohort |
|---|---|---|
| Candidates | 105 | median 16 |
| Random | 0.95% | 11.8% |
| **Top-1** | 69.0% | **85.3%** |

**Within-task accuracy is higher, not lower.** The confound is real page-to-page,
but Case 1 scores a page against a signature averaged over many worksheets, and
that averaging dilutes it. The pairwise number does not transfer to the ranking
task — two different mechanisms, one treated as evidence about the other.

### 4.8 A planned mitigation that would have removed the right answer

Session 1 deferred an option: *"exclude any candidate who shares a worksheet
with the page being checked."* **This is wrong for the scenario the product
exists to catch.** When C hands in a paper A wrote, A sat the *same assigned
worksheet*. Excluding same-worksheet candidates removes the true writer from the
candidate list entirely.

The exclusion belongs one level down — at the **signature**, not the candidate.
Done there it helps: 82.9% → 85.3%.

### 4.9 Infrastructure traps

| Trap | Consequence | Fix |
|---|---|---|
| Analysis scripts fetched uncached pages serially | A rerun on a half-filled cache would re-download 4495 pages one at a time | `main.load_items(cache_only=True)` |
| Feature cache keyed on url alone | Changing a feature silently blends old and new vectors — both well-formed floats, so it looks like noise, not an error | `FEATURE_VERSION` in the cache path |
| Re-extraction covered more pages than the previous version | Would have measured a feature change and a data change together, inseparably | `restrict_to_shared_pages` pins both versions to their intersection |
| Serial extraction at 8171 pages ≈ 4 hours | Unaffordable iteration | `prefetch.py`, process pool, ~100/min |
| Apple Accelerate BLAS raises divide-by-zero inside `matmul` on finite inputs | Noise, or a masked real problem | Verified against `einsum` and a dot-product loop (agree to 4e-16), suppressed **by message** only |

---

## 5. The final solution, and what it outputs

### 5.1 Running it

```bash
cd handwriting_detect/writer_identification/pipeline

python3 identify.py --list-students     # 105 enrolled, 76 with a solid reference
python3 identify.py --list-cohorts      # 114 ready-made --cohort arguments
python3 identify.py <image-url-or-path> --cohort <ids...> --submitted-by <id>
```

### 5.2 Real output

```
Image        : https://.../page_3_be1bbc16.jpg
Candidates   : 6 (random baseline 16.7%)

Looks most like : 6a3265aa8f0123283ccc44f0
Confidence      : 100.0   (margin to runner-up 47.4%)

rank  student_id                  distance
   1  6a3265aa8f0123283ccc44f0      8.3283
   2  6a17e09bb3708ff1e18957b8     15.8227
   3  6a0ac1000309a51de3c317ea     15.9228
   4  69c8e56b82044ba4decad926     16.0189
   5  69da456797fe8d1d6a54f412     16.6178
   6  69fbfff6b54fa10b6546a256     17.7531

Caveats:
  - Closed-set: assumes the writer is one of the candidates...
  - Ranking only -- not a verdict...
```

**How to read it.** The top match at 8.33 against five candidates bunched
between 15.8 and 17.8 is the strong pattern: one clearly separated, five
indistinguishable. Compare a weak result — 8.42 vs 9.27, a 9.1% margin — which
is close to a coin flip and should not be leaned on.

`--json` returns the same plus `candidates_without_history`, `ink_px`,
`submitter_rank` and `submitter_is_top_match`.

### 5.3 Measured accuracy

| Configuration | Candidates | Top-1 | Top-2/5 | Random | Lift |
|---|---|---|---|---|---|
| **Deployment** (students assigned that worksheet) | median 16 | **85.3%** | 91.6% (top-2) | 11.8% | 7.2× |
| Full roster | 105 | 69.0% | 81.4% (top-5) | 0.95% | ~72× |

Leave-one-out, closed-set, 956–1255 real queries. **The two rows are not
comparable** — 16 candidates is a far easier ranking problem than 105, which is
why lift falls as top-1 rises. Always quote the baseline alongside.

### 5.4 It deliberately emits no verdict

No `OK` / `MISMATCH` / `UNKNOWN_WRITER`. **14.7% of genuine submissions rank
someone else first.** Flagging on a top-1 mismatch would wrongly implicate
roughly one honest student in seven. The threshold that would justify a verdict
has not been calibrated.

---

## 6. Limitations

### 6.1 Closed-set — the most important one

Every score is **relative to the candidates supplied**. A page written by a
parent, sibling, tutor, or a student from another section still returns a
confident enrolled name. The top match is **wrong, not absent**. There is no
"none of these" answer.

This is the single biggest gap between "useful ranker" and "safe flagger".

### 6.2 Distances are not interpretable in absolute terms

The units come from a whitened, PCA-rotated space. The scale depends on the
corpus the transform was fitted on, and drifts with how much ink a page carries.
There is no "under 10 means same writer" rule. Only the **gap** is meaningful —
which is why confidence derives from the margin, not the distance.

### 6.3 Confidence is a formula, not a probability

`min(margin × 400, 100)`. Reasonable, monotonic, and **not validated against
hand-reviewed outcomes.** A confidence of 100 does not mean 100% likely correct.

### 6.4 Everything else

| Limitation | Detail |
|---|---|
| **Cold start** | Under ~4 worksheets across 3+ dates, no usable signature. 29 of our 105 are marked `THIN` |
| **Habitual offenders invisible** | If C always submits A's work, C's signature *becomes* A's handwriting. Needs a per-student bimodality check — not started |
| **No direction** | Says a page matches A, never who copied from whom |
| **Cannot detect dictation** | If A dictated and C wrote it in C's own hand, every pixel signal is clean |
| **Label noise** | Signatures are built from *submitter*, not writer. Cheating already in history corrupts the reference |
| **Drift** | Handwriting changes over months; our data spans June–October. Rolling-window signatures untested |
| **Pen/paper/injury changes** | Shift the fingerprint and cause false positives |
| **One upload path** | All data came via PDF rasterisation. Direct-photo behaviour untested |
| **Non-random sample** | The 105 students are the head of the fetch order, not a random draw |
| **Short answers** | This literature reports 20–30% accuracy loss at one line of text. An ink floor exists but the accuracy-versus-ink curve was never measured |

### 6.5 Future work, in priority order

1. **Open-set rejection** — an absolute "close enough to name at all" threshold.
   Required before any output reaches a teacher.
2. **Threshold calibration** on hand-reviewed results, per school.
3. **Accuracy vs ink quantity** — cheap, already have `ink_px`, converts the
   worst inputs from silent errors into honest refusals.
4. **Exemplar SVM at query time** — repeatedly one of the larger gains in this
   literature; no labels, no training data, no new features.
5. **Quill** — joint distribution of ink direction vs ink width. We already
   compute the per-pixel width map and discard all but two scalars.
6. **Train on our own writer labels** (§3) — the real ceiling-raiser.
7. **Habitual-offender bimodality check.**

Full backlog with costs: [`improvements.md`](improvements.md).

---

## 7. Explaining this to someone else — the technical walkthrough

Use this to brief an engineer. Roughly 10 minutes end to end.

### Step 1 — Frame the problem (1 min)

> "Students photograph handwritten homework. Sometimes the person who submitted
> a page didn't write it. Given a page and a list of students we have past work
> for, we want to say whose handwriting it is — as evidence for a teacher, never
> as a verdict."

Key framing point: **this is a ranking problem, not a classification problem.**
We rank candidates by similarity. We do not emit a decision.

### Step 2 — The central trick (2 min)

> "We never look at *what* was written, only at *how*. For every point along the
> outline of the ink, we look a fixed distance forward and backward along that
> same outline and record the two angles. A page gives tens of thousands of
> angle pairs. Bin them into a 12×12 grid and you get 144 numbers describing how
> sharply that person bends a pen stroke."

Anticipate the obvious question — *why doesn't this just measure the words?*

> "Because one letter contributes a handful of points out of thousands. At that
> scale what survives is a habit, not a letterform. We know this matters because
> we tried per-letter shape statistics first and they failed exactly this way:
> two students answering the same question scored as similar regardless of
> handwriting."

### Step 3 — The pipeline (3 min)

```
image bytes
  → greyscale
  → ink mask        adaptive threshold AND Otsu, ruled lines removed by Hough,
                    speckle dropped
  → scale normalise resample so the pen stroke is 7px wide
  → fingerprint     144 Hinge bins + 5 scalars = 149 numbers
  → transform       sqrt → L2-normalise → PCA-whiten   (fitted on the corpus)
  → distance        Euclidean to each student's signature
  → rank            nearest first, confidence from the margin to the runner-up
```

> "A student's signature is just the average of their past page fingerprints.
> When we score a page that's already in their history, we rebuild the signature
> without it — otherwise we'd be comparing a page against a reference it helped
> create."

### Step 4 — Where the accuracy came from (2 min)

This is the most interesting part technically, and worth telling honestly:

> "We doubled accuracy without touching the features. The comparison maths was
> wrong. We were z-scoring all 149 dimensions and taking Euclidean distance, but
> 144 of them are a probability histogram.
>
> We predicted chi-square distance would fix it. **It didn't — it scored worse.**
> What the numbers showed was that z-scoring is *also* whitening, and the
> whitening was carrying the value. So we applied the full recipe this
> literature actually uses: square-root the bins, L2-normalise, then PCA-whiten.
> 27.7% to 67.1% on identical cached vectors.
>
> Then we checked it wasn't an artifact. PCA-whitening on 142 samples in 149
> dimensions is exactly where whitening amplifies noise directions, so if the
> test page joined its own fit it would look artificially separable. We refit
> the transform for every query with that query excluded. The gap was 0.4%."

### Step 5 — The confound, and the honest retraction (2 min)

> "We found a control saying two different students doing the same worksheet
> look *more* alike than one student across two days. We raised it as a blocker:
> the product runs within one class on one worksheet, which is exactly that
> configuration.
>
> That was wrong, and the way it was wrong is instructive. The control was
> measured **page against page**. The system scores **page against a signature
> averaged over many worksheets**, and that averaging dilutes the shared content.
> We'd taken a number from one mechanism as evidence about a different one. When
> we actually measured the deployment task, accuracy was *higher* — 85.3%,
> because 16 candidates is a much easier ranking problem than 105."

### Step 6 — The numbers, with their baselines (1 min)

> "85.3% top-1, 91.6% top-2, ranking against the students assigned that
> worksheet — median 16 candidates, random 11.8%. Against all 105 students it's
> 69%, random 0.95%. **Those two are not comparable.** The bigger number is the
> easier task. Always quote the baseline."

### Step 7 — What it must not be used for (1 min)

Close on this, not on the accuracy:

> "It's closed-set. It assumes the writer is one of the candidates. Hand it a
> page written by someone's mother and it returns a confident name belonging to
> a child who did nothing wrong.
>
> And 14.7% of genuine submissions rank someone else first. Flag on top-1
> mismatch and you'd wrongly implicate one honest student in seven.
>
> So it ships as ranked suggestions for a human to review, and it emits no
> verdict at all until we've built open-set rejection and calibrated a threshold
> against hand-reviewed cases. We're making claims about minors — the cost of a
> false positive isn't symmetric with the benefit of a true one."

### Questions you will get, with answers

| Question | Answer |
|---|---|
| *Is there a model? What was it trained on?* | No model. No training. Direct pixel measurements plus one unsupervised PCA rotation fitted on our own unlabelled images. |
| *Why not deep learning?* | Nothing pretrained exists for this task — public handwriting models do transcription, generation or signature verification. We *could* train one: every page carries the submitter's `user_id`, which is the right label. We haven't because the classical route still had room, and the whitening fix proved it. |
| *Does it work on any handwriting?* | Untested outside our data. All of it arrived by one upload path, from one grade range, on ruled notebook paper. |
| *What if the student writes differently that day?* | It shifts the fingerprint and causes a miss. Pen changes, paper changes and injuries all do. Thresholds must be calibrated against real reviewed cases, never chosen theoretically. |
| *Can it tell who copied from whom?* | No. It reports that a page matches A's handwriting, never direction. |
| *What about a student who always submits someone else's work?* | Invisible to this. Their signature *becomes* the other person's handwriting. Needs a separate bimodality check — not built. |
| *Why not just compare the photos directly?* | That's Problem 2 (submission linking) — paper, lighting, camera, upload timing. It's built, independent, and catches a different thing. The two are honest second opinions on each other. |
