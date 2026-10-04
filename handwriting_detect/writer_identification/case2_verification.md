# Case 2 — Verification: "Were these two pages written by the same hand?"

> Parent: [`README.md`](README.md) · [`../goal.md`](../goal.md)
> Sibling: [`case1_identification.md`](case1_identification.md)

## The question

Given two pages, decide whether one person wrote both. No names involved.

Typical use: a batch of submissions, one page per student. Find any two that
share a hand.

## Input

| What | Detail |
|---|---|
| Page A | One image |
| Page B | One image |

That is all. **No history. No enrolment. No past work.**

This is the main difference from Case 1, and it's why this case can run today on
images we already have cached.

## How it works

**Step 1 — Fingerprint both pages.**

Identical to Case 1. Each page becomes a list of numbers describing how it was
written:

- slant — the angle letters lean
- stroke width — how thick the pen line is
- curviness — rounded vs angular letterforms
- spacing — gaps between letters and words
- pen lifts — how often the writer breaks the stroke

Computed from the ink only; the paper is masked out first.

No model. No training.

**Step 2 — Measure the distance between them.**

One number. Small = same hand, large = different hands.

**Step 3 — Compare against a threshold.**

The threshold is not chosen theoretically. See *Calibration* below.

## Output

```json
{
  "page_a": "https://.../page_1_abc.jpg",
  "page_b": "https://.../page_1_xyz.jpg",
  "submitted_by_a": "student_C",
  "submitted_by_b": "student_A",
  "same_hand": true,
  "score": 82,
  "why": [
    "slant within 1.2 degrees",
    "stroke width and letter spacing closely matched",
    "same pen-lift pattern"
  ]
}
```

Emit the raw distances too, not just the verdict — for every pair, including
the ones that don't fire. Thresholds can't be calibrated from data that was
never recorded.

## This is the hardest setting

One page against one page is the noisiest comparison possible. Case 1 averages
several pages into a reference, so individual-page noise cancels out. Here there
is nothing to average.

Expect this to be less accurate than Case 1, not more, despite needing less
data.

Two mitigations:

- If either side has multiple pages, compare all page-pairs and aggregate.
- Decline to score pages below a minimum ink threshold rather than guessing.

## How this relates to Problem 2

Problem 2 (submission linking, already built) compares the **paper, lighting and
camera** and deliberately ignores the handwriting.

Case 2 compares the **handwriting** and deliberately ignores everything else.

Same pairwise shape, opposite inputs. Their failure modes are unrelated, so when
both agree on a pair that is genuinely strong evidence. When they disagree, each
explains the other:

| Problem 2 | Case 2 | Reading |
|---|---|---|
| Linked | Same hand | Strong. Photographed together *and* written by one person |
| Linked | Different hands | Study group at one table. Innocent |
| Not linked | Same hand | Copied separately, different sittings. Worth attention |
| Not linked | Different hands | Nothing |

That bottom-left row is the case Problem 2 structurally cannot catch, which is
most of the value here.

## Calibration — this case supplies it for free

Take a batch of 30 students, one page each. Every one of those 435 pairs is a
different person. So **every match the system reports is a false positive, by
construction.**

That yields statements like *"a score of 85 occurs in 0.4% of pairs known to be
different"* — measured, not hoped.

This is exactly the impossible-pairs calibration Problem 2 still owes and never
got. Running Case 2 over a mixed batch produces it as a side effect.

Caveat: this measures the false-positive side only. It cannot show the system
*finds* true matches, because the batch contains none. For that, use Case 1's
held-out ground-truth test.

Repeat per school. A school with uniform tablets and issued notebooks has a
completely different baseline from one where students use their own phones.

## The gate — run before building anything downstream

Same gate as Case 1; both cases live or die on it.

**Do the fingerprints track the hand, or the paper?**

| Comparison | Expected if fingerprints are real |
|---|---|
| Same student, same worksheet | closest |
| Same student, **different date** | **still clearly closer than the row below** |
| Different students | furthest |

The middle row is the whole test. If it collapses toward "different students",
we're measuring paper and lighting, and this doesn't work.

Note this gate needs multi-date history per student — which Case 2 itself
doesn't require, but *validating* Case 2 does.

## Before even that — the 2-hour viability check

Our images arrive via PDF rasterisation at 96 DPI, a path that already killed
three of Problem 2's seven clues.

Measure on existing cached images:

1. **Stroke width in pixels.** Below ~4px there's no letterform left, only
   compression noise. No model recovers this — the information isn't in the file.
2. **Printed text on the page.** Worksheet question text left in makes every
   student's fingerprint partly the same printed font, inflating all similarity
   scores.
3. **Ink per page.** Below some minimum, decline to score.

## Known limits

- **Noisiest setting.** One page vs one page, nothing averages out.
- **Short answers** produce unstable fingerprints.
- **No direction.** Says two pages share a hand, never who wrote for whom.
- **No identity.** Says "these two match", not "this is A's handwriting". That's
  Case 1.
- **Pen, paper or injury changes** shift the fingerprint and cause misses.
- **Not an accusation.** Output is evidence for a teacher. Claims about minors;
  every flag must be reviewable and appealable.

## Build order

1. Viability check on cached images.
2. Fingerprint extractor (shared with Case 1).
3. Pairwise scoring + raw-distance dump.
4. **The gate** — needs the multi-date fetch, same as Case 1.
5. Calibration run over a known-all-different batch.
6. Threshold set from that distribution.
