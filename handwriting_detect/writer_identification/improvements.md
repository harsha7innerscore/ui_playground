# Case 1 — the improvement backlog

> Parent: [`README.md`](README.md) · survey: [`approaches.md`](approaches.md)
> Status at time of writing: **78.2% top-1 / 96.5% top-5 over 11 students**
> (`sqrt+l2+pca64`, leave-one-out, transform refit per query). The 181-student
> re-run is pending.

Ordered by **cost to try**, not by expected gain. Everything in group A needs no
new image processing and runs off the existing fingerprint cache in minutes —
those get tried first and exhausted before anything in B or beyond.

Every item is measured the same way: `evaluate.py --honest`, reporting top-1,
top-5, MRR, lift, and the two bucket AUCs. An item only counts as a win if it
also leaves `auc_vs_content_confound` no worse — a change that raises accuracy
by learning the worksheet rather than the hand is a regression wearing a
disguise.

---

## A. Scoring and encoding — no new extraction, minutes per experiment

### A1. Sweep the PCA dimension properly
We tried 32 / 64 / full and 64 won. Three points is not a sweep. Try 16, 24,
32, 48, 64, 96, 128, and also keeping a *fraction of variance* rather than a
fixed count. **Cost: minutes. Expect: small but free.**

### A2. Cosine distance after whitening
This literature ranks with cosine on L2-normalized encodings, not Euclidean. We
use Euclidean. After whitening these are related but not identical, and the
difference is a one-line change. **Cost: minutes.**

### A3. Exemplar SVM at query time ← strongest cheap item
For a query page, train a linear SVM with **that one page as the only positive**
and every other student's encoding as negatives, then rank by its decision
value instead of by distance. Repeatedly reported as one of the larger single
gains in this literature, and it needs no training data, no labels, and no new
features — just scikit-learn at query time.

Why it works: a plain distance treats every direction in the feature space as
equally meaningful. An exemplar SVM learns, for this specific query, which
directions actually separate it from the general population. **Cost: hours.**

### A4. k-reciprocal re-ranking and query expansion
After the initial ranking, refine it using the neighbourhood structure: if the
query and a candidate are each in the other's top-k, that is much stronger
evidence than a one-way match. Query expansion then re-queries with the average
of the query and its top matches. Reported to improve mAP on three writer-ID
datasets. **Cost: hours.**

### A5. Score per page, then vote — instead of averaging pages, then scoring
We currently average a worksheet's pages into one vector and score that once.
The alternative is to score each page against each candidate and combine the
*rankings* (vote, or mean reciprocal rank). Averaging first lets one bad page —
a near-blank one, a photo of the wrong thing — drag the whole worksheet's
vector. Voting isolates it. **Cost: hours. Worth it for robustness alone.**

### A6. Signature construction: mean vs median vs trimmed mean
A student's signature is currently the plain mean of their worksheets. One
outlier worksheet (bad scan, different pen, or genuinely someone else's work)
shifts it. Median or trimmed mean is a one-line change and directly targets the
habitual-offender blind spot, where a student's history is contaminated.
**Cost: minutes.**

---

## B. Better features — hours to a day each

### B1. Quill ← best effort/reward in this group
Joint distribution of **ink direction against ink width**. We already compute
the per-pixel width map in `stroke_width()` and throw everything away except
two scalars. Quill pairs that same map against local contour direction.
Reported 63–95% alone, and 70–97% fused with Hinge as "QuillHinge" — i.e. the
combination beats either. Most of the work is already in the codebase, unused.

### B2. Patch-based extraction and aggregation
Cut each page into overlapping patches, fingerprint each patch, aggregate. This
is standard practice and it directly addresses our biggest data weakness:
pages differ enormously in how much ink they carry, and a whole-page histogram
from a three-word answer is dominated by noise while one from a full page is
stable. Per-patch extraction makes every page contribute comparable units.

### B3. Multi-scale Hinge
`HINGE_LEG_PX = 7` is one arbitrary scale. Computing Hinge at several leg
lengths (say 3, 5, 7, 11, 15) and concatenating captures both fine curvature
and broad stroke shape. Standard, cheap, usually helps.

### B4. Hinge parameter sweep
`leg_px` and `bins` were taken from the literature's defaults and never tuned on
our data. Our images are a different resolution and a different capture path, so
the defaults are unlikely to be optimal. **Cost: a few hours of compute.**

### B5. Other textural descriptors
Chain-code / contour-direction PDFs, COLD (length-angle distribution of segments
between contour points), Junclets (stroke junction types). Each is cheap
individually; the literature's consistent message is that **fusion of several
descriptors beats any single one.**

### B6. Grapheme / allograph codebook
Cut ink into fragments, k-means them into a codebook over our own unlabelled
corpus, represent a page as a histogram over which shapes it used. This is the
half of the original design doc's "classic route" that was never built — we
built the textural half (Hinge) only, and the big published numbers come from
fusing textural **with** allographic.

**Caveat:** grapheme codebooks are more content-sensitive than Hinge, so this
may reintroduce the content confound. Watch `auc_vs_content_confound` closely.

---

## C. Local descriptors with proper encoding — a few days

### C1. RootSIFT + VLAD / Fisher vectors
The modern classic baseline. Extract RootSIFT at keypoints on the ink, build an
unsupervised vocabulary (k-means for VLAD, GMM for Fisher), encode each page by
aggregating residuals against that vocabulary, then **power-normalize,
L2-normalize and PCA-whiten** — the same normalization chain that just took us
from 40.8% to 78.2%, which is direct evidence it matters on our data too.

Optionally generalized max pooling (GMP) instead of sum pooling.

No writer labels needed; the vocabulary is unsupervised. `opencv-contrib` has
SIFT, scikit-learn has k-means and GMM. CPU only.

---

## D. Learned representations — needs a GPU

### D1. Self-supervised CNN (Christlein et al.)
Cluster SIFT descriptors, use the cluster index as a surrogate label, train a
ResNet on 32×32 patches, encode pages with multi-VLAD over its activations. No
writer labels. Reported 84.1% CLaMM16 / 88.9% Historical-WI.

### D2. Supervised metric learning on our own writer labels ← the ceiling-raiser
Every page carries the submitter's `user_id`. That is exactly the label a
writer-ID model trains on. 181 students / 8171 pages in hand, ~703 / 27k
available. Triplet or ArcFace over a ResNet backbone, trained on **our** paper,
**our** capture path, **our** short answers — which is precisely where a
benchmark-trained model would transfer worst.

Caveats: labels are *submitter*, not writer, so any cheating already in the
history is label noise; the split must be **by student**, not by page; and the
gate's bucket machinery must be run on the result, because a CNN will happily
learn the notebook instead of the hand if we let it.

---

## E. Protocol work — not accuracy, but required before shipping

### E1. Accuracy as a function of ink quantity ← do this early, it is cheap
Text quantity is the dominant driver in this literature: reported accuracy falls
20–30% at one text line, but holds above 90% of page-level accuracy from about
four lines upward.

We have `ink_px` on every fingerprint already. Plot accuracy against it and find
our own cutoff, then **decline to score below it** rather than emitting a
confident guess. This converts our worst inputs from silent errors into honest
`INSUFFICIENT_INK` responses, and it costs one afternoon.

### E2. Open-set evaluation
Everything so far is closed-set — the true writer is always among the
candidates. Real submissions include pages written by a parent, sibling or tutor
who is in no candidate list. A pure ranker always returns a name, so open-set
needs an absolute "is this close enough to name at all" threshold. **This is
required before any output reaches a teacher**, because the failure mode is
confidently naming an innocent student.

### E3. Rolling window for handwriting drift
Signatures currently use a student's whole history. Handwriting changes over
months, and our data already spans June to October. Test whether recent-only
signatures beat all-history ones.

### E4. Habitual-offender bimodality check
If C always submits A's work, C's signature *becomes* A's handwriting and
nothing looks wrong. Detect by checking whether a student's own pages split into
two distinct clusters. Independent of everything above.

---

## Suggested run order

1. **Re-baseline on 181 students** — nothing below means anything without it.
2. **A1, A2, A6** (minutes each), then **A5**, then **A3** (exemplar SVM, the
   strongest cheap item), then **A4**.
3. **E1** (ink floor) — cheap, and improves the honesty of every number after it.
4. **B1 (Quill)**, then **B3/B4**, then **B2 (patches)**.
5. **C1 (SIFT+VLAD)** if A and B plateau below target.
6. **D2** only if a GPU and a clear accuracy target justify it.
7. **E2 (open-set)** before anything is shown to a teacher, regardless of where
   accuracy has landed.

## Sources

- [Re-ranking for Writer Identification and Writer Retrieval](https://arxiv.org/pdf/2007.07101)
- [Christlein et al., Writer Identification Using GMM Supervectors and Exemplar-SVMs](https://www.researchgate.net/publication/309185230_Writer_Identification_Using_GMM_Supervectors_and_Exemplar-SVMs)
- [Christlein et al., Encoding CNN Activations for Writer Recognition](https://arxiv.org/pdf/1712.07923)
- [Christlein et al., Unsupervised Feature Learning for Writer Identification](https://arxiv.org/pdf/1705.09369)
- [Towards the Influence of Text Quantity on Writer Retrieval](https://arxiv.org/pdf/2506.07566)
- [Brink et al., Quill — directional ink-trace width measurements](https://www.ai.rug.nl/~mbulacu/brink-quill-pr2012.pdf)
- [FragNet: Writer Identification using Deep Fragment Networks](https://arxiv.org/pdf/2003.07212)
- [Offline Text-Independent Writer Identification based on word level data](https://arxiv.org/pdf/2202.10207)
- [NetVLAD with re-ranking for writer identification](https://arxiv.org/pdf/2012.06186)
- [VLAD / GMP / Exemplar-SVM reference implementation](https://github.com/Waleed-Hesham/Writer-Identification-Retrieval)
