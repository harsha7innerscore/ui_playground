# Writer identification — the available approaches, and which ones fit us

> Parent: [`README.md`](README.md) · [`case1_identification.md`](case1_identification.md)
> Written after a literature survey, to answer one question: **how do we get
> Case 1 above its current 40.8% top-1?**

## Read this first: why our number and published numbers aren't comparable

Published writer-ID systems report 81–99% top-1. We report 40.8%. That gap is
mostly **not** implementation quality. Three reasons, and they matter for
deciding what to build:

| | Published benchmarks (IAM, CVL, ICDAR13) | Our data |
|---|---|---|
| Content | A fixed paragraph, every writer copies the same prepared text, several hundred words | Short homework answers, a few words to a few lines |
| Capture | Flatbed scan, 300dpi, controlled | Phone photo → PDF → server rasterisation |
| Page | Clean white sheet | Ruled notebook, bleed-through, spiral binding, facing page |
| Pen | Usually one prescribed pen | Whatever the child had |

**Text quantity is the single biggest driver** in this literature, and our pages
sit at the low end of it. So treat 81% as "what the feature can do given plenty
of ink," not as a target we're failing to hit. The honest target is *better than
40.8% on our own data*, measured the same way each time.

A second trap, already flagged: top-1 is not comparable across candidate-pool
sizes. 40.8% was against 11 students. Against 181 it will drop while the system
improves. Track **lift over random**, **top-5**, and **mAP**.

---

## Tier 0 — Fix what we already built (cheapest, probably the biggest single win)

Before adding any new feature, three things in the current code look wrong
against how this literature actually uses these features.

### 0a. The distance metric is wrong for a histogram

`gate.standardize()` z-scores all 149 dimensions, then `gate.distance()` takes
plain Euclidean. But 144 of those dimensions are a **joint probability
distribution** (the Hinge histogram). The literature compares these with
**chi-square** or Bhattacharyya/Hellinger distance, not z-scored Euclidean.

Why this is likely hurting us, concretely: z-scoring divides each bin by its
standard deviation across the corpus. Hinge bins are extremely unequal — some
carry most of the mass, many are near-empty. Dividing a near-empty bin by its
own tiny standard deviation **amplifies the noisiest bins to the same weight as
the informative ones**. That is close to the worst thing you can do to a
sparse histogram.

**Action:** compare chi-square on the raw (un-z-scored) Hinge histogram against
the current metric. Pure scoring change, no new extraction, runs off the
existing cache in minutes.

### 0b. 5 scalars and 144 histogram bins are being summed into one distance

`stroke_width_mean`, `stroke_width_ridge`, `ink_density`, `gap_mean`, `gap_std`
sit in the same Euclidean sum as 144 Hinge bins. Their contribution is ~3% of
the vector by count, and the weighting between the two kinds of evidence is
accidental rather than chosen.

**Action:** compute a distance per feature *group*, then fuse the distances
(sum of z-scored per-group distances, or simple weighted sum tuned on held-out
data). This is also how the papers combine textural with allographic features.

### 0c. We never checked whether the scalars help at all

They may be adding noise. `diagnose_features.py` already exists to answer this.

**Expected value of Tier 0:** unknown but potentially large, cost is hours, and
it needs no new data or model. **Do this first.**

---

## Tier 1 — More handcrafted textural features (same family as Hinge)

Hinge is one member of a family. Published results for the family, on clean
benchmark data:

| Feature | What it measures | Reported top-1 |
|---|---|---|
| **Hinge** (built) | Joint PDF of two contour-tangent directions hinged at a point | ~81% |
| **Quill** | Joint PDF of ink *direction* vs ink *width* — how the pen's thickness varies with stroke direction | 63–95% |
| **QuillHinge** | The two combined | 70–97% |
| Contour-direction / chain-code PDFs | Simpler single-angle distributions | Lower, but cheap and complementary |
| **COLD** | Distribution of (length, angle) of line segments between contour points | Competitive |
| **Junclets** | Junction types where strokes cross | Complementary |

**Why Quill is the standout candidate for us.** It needs the ink-width map,
which we *already compute* — `stroke_width()` runs a distance transform over the
ink mask and currently throws away everything but two summary scalars. Quill
pairs that per-pixel width against the local contour direction. Most of the
work is already done; we are discarding the information.

**The general lesson from this literature: fusion beats any single feature.**
Combining textural (Hinge/Quill) with allographic (Tier 2) is what produces the
high numbers, not any one descriptor.

---

## Tier 2 — Allographic / codebook features (unsupervised, uses our own data)

This is the half of the classic approach the original design doc described —
*"local descriptors aggregated into a fixed-length vector"* — that was **never
built**. We built the textural half (Hinge) only.

**Method.** Cut the ink into small fragments (graphemes/"fraglets" — connected
components or contour segments). Pool fragments from the whole unlabelled
corpus, k-means them into a codebook of a few hundred shapes. A page becomes a
**histogram over which shapes it used**. Two pages by one writer use the same
idiosyncratic shapes at the same rates.

**Why it fits us:** the only fitting step is k-means over our own unlabelled
images, CPU, minutes. No labels, no GPU. Exactly what the design doc specified.
And it is *complementary* to Hinge — different failure modes, which is why the
papers fuse them.

**Caveat for our data specifically:** grapheme codebooks are more
content-sensitive than Hinge, so this may reintroduce the content confound the
Hinge swap was made to fix. Must be evaluated against the
`diff_student_same_content` control bucket, not just overall accuracy.

---

## Tier 3 — SIFT + VLAD / Fisher-vector encoding (unsupervised, no training)

The modern classic baseline, and still strong.

**Method.** Extract RootSIFT descriptors at keypoints on the ink. Build a
vocabulary (k-means for VLAD, or a GMM for Fisher vectors) over descriptors from
our own corpus. Encode each page by aggregating its descriptors against that
vocabulary into one long vector. Then PCA-whiten and L2-normalise — **the
normalisation steps are not optional cosmetics in this literature, they carry a
large part of the reported gain.**

Fiel & Sablatnig's Fisher-vector version and Christlein's GMM-supervector
version were state of the art on ICDAR11/13 and CVL. No writer labels needed —
the vocabulary is unsupervised.

**Fit for us:** good. `opencv-contrib` has SIFT, scikit-learn has k-means/GMM.
No GPU. This is the strongest option that requires no training and no labels.

---

## Tier 4 — Self-supervised CNN (Christlein et al., ICDAR 2017)

**Method.** Extract SIFT descriptors, cluster them, and use **the cluster index
as a fake class label** to train a ResNet on 32×32 patches cut at those
keypoints. The network never sees a writer label. Then encode pages with
(multi-)VLAD over the network's activations.

Reported: 84.1% CLaMM16, 88.9% Historical-WI.

**Fit for us:** needs a GPU and real implementation effort. Worth knowing about;
not the next step.

---

## Tier 5 — Supervised CNN on our own writer labels ← **under-rated, re-read this**

The design docs repeatedly say "no training required, no labelled examples
needed." That is true and important — but it refers to **labelled cheating
examples**, which genuinely don't exist. It has been quietly read as "we can't
train anything," and that is wrong.

**We have writer labels. That is exactly what writer-ID models train on.**
Every page carries the `user_id` that submitted it. After this session's fetch:
**181 students, 8171 pages** — and 703 students / ~27k pages are available if we
pull wider.

That is a legitimate, non-trivial training set for a metric-learning model
(triplet/ArcFace over a ResNet backbone) producing an embedding where same-writer
pages sit close. It would be trained on *our* data — our paper, our capture path,
our short answers — rather than on clean benchmark scans, which is precisely
where published models would transfer worst.

**The honest caveats:**
- The labels are *submitter*, not *writer*. If the cheating we're hunting is
  already present in the history, those labels are wrong — a small amount of
  label noise, which metric learning tolerates, but it should be stated.
- Needs a GPU and a proper held-out split **by student**, not by page.
- Risks learning the paper, the notebook, or the capture setup instead of the
  hand — the same confound the gate was built to detect. The existing bucket
  machinery (`gate.py`) is the right harness to catch that, and must be run on
  any trained model before it is trusted.

---

## Tier 6 — Off-the-shelf pretrained model

The original design doc treated this as a drop-in upgrade. **Survey finding: it
largely isn't available.** Public pretrained handwriting models are for
*transcription* (TrOCR, CTC-based HTR), *generation* (DiffusionPen), or
*signature verification* (`sigver`) — different tasks. Published writer-ID
papers mostly release results, not weights.

Closest usable things: signature-verification embeddings (trained on a related
but different task, and on signatures rather than running text), or generic
ImageNet/DINO features as local descriptors inside a Tier 3 encoding.

**Action:** stop treating "just use a pretrained model" as the easy escape
hatch. It is not sitting there ready.

---

## Recommended order

1. **Tier 0** — fix the distance metric and the feature fusion. Hours, no new
   data, possibly the largest single gain available.
2. **Re-measure on the new 181-student cohort** with lift/top-5/mAP, so there is
   an honest baseline to improve against.
3. **Tier 1 (Quill)** — reuses the width map we already compute and discard.
4. **Tier 3 (SIFT + VLAD/Fisher)** — strongest no-training option.
5. **Tier 2 (grapheme codebook)** — fuse with the above; watch the content
   control bucket closely.
6. **Tier 5 (train on our own writer labels)** — the real ceiling-raiser, and
   the only option whose training data matches our capture path. Needs a GPU.

Every step gets validated on the same four-bucket gate and the same leave-one-out
test, so improvements are comparable to each other rather than each being
measured its own favourable way.

## Sources

- [Bulacu & Schomaker, text-independent writer ID using textural and allographic features](https://www.researchgate.net/publication/6506626_Text-Independent_Writer_Identification_and_Verification_Using_Textural_and_Allographic_Features)
- [Brink et al., Quill — directional ink-trace width measurements](https://www.ai.rug.nl/~mbulacu/brink-quill-pr2012.pdf)
- [Christlein et al., Unsupervised Feature Learning for Writer Identification](https://arxiv.org/pdf/1705.09369)
- [Christlein et al., Writer Identification Using GMM Supervectors and Exemplar-SVMs](https://www.sciencedirect.com/science/article/abs/pii/S0031320316303211)
- [Christlein et al., Encoding CNN Activations for Writer Recognition](https://arxiv.org/pdf/1712.07923)
- [NetVLAD with re-ranking for writer identification/retrieval](https://arxiv.org/pdf/2012.06186)
- [Towards the Influence of Text Quantity on Writer Retrieval](https://arxiv.org/html/2506.07566)
- [ICDAR 2019 Competition on Image Retrieval for Historical Handwritten Documents](https://arxiv.org/pdf/1912.03713)
- [Offline Writer Identification Using CNN Activation Features](https://arxiv.org/pdf/2402.17029)
