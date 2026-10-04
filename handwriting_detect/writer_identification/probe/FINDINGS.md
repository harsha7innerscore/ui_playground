# Viability probe — findings

> Run: `python3 viability_probe.py --sample 30`
> Data: 11 students, 66 worksheets, 154 full pages, 695 answer crops.
> Measured: 30 full pages + 30 answer crops, sampled at random.

## Verdict: PASS — build the fingerprint

The images carry more handwriting detail than the Problem 2 write-up led us to
expect. Nothing here blocks Case 1.

## 1. Resolution — not a constraint

| | Full pages | Answer crops |
|---|---|---|
| Median size | 2049 × 2778 (5.7 MP) | 1931 × 265 (0.46 MP) |
| Stroke width, mean estimator | 7.57 px | 6.12 px |
| Stroke width, ridge estimator | 8.00 px | 5.60 px |
| Below the 4 px bar | 0/30 | 0/30 |

Two independent estimators, both from the distance transform, agree closely
(7.6 vs 8.0, 6.1 vs 5.6). Agreement matters as much as the value: it says the
ink mask is finding strokes, not compression noise.

**The "96 DPI" figure in `PROJECT_SUMMARY.md` §4 is a JPEG header tag, not the
actual detail level.** The pages are roughly A4 at ~250 DPI effective. The
resolution worry that justified running this probe does not apply.

## 2. Printed question text — not present at all

Looked at sample pages directly rather than inferring from ink statistics.

Students write answers on **plain ruled notebook paper**. There is no printed
worksheet on the page — just the question number in the student's own hand,
then the answer.

This kills one of the three concerns outright. Full pages can be fingerprinted
directly; no printed-text removal step is needed, and there is no shared printed
font to inflate similarity between students.

## 3. Ink quantity — fine, but set a floor

Ink coverage is ~10% median for both pages and crops. Crops range down to 1%,
and the smallest crop measured was 65 px tall at 0.02 MP — a couple of words.

Those will not produce a stable fingerprint. Needs a minimum-ink cutoff below
which we decline to score rather than guess.

## New problems the probe found

Three contaminants, all visible on inspection, none fatal — but all of them end
up in the ink mask today and none of them is handwriting:

**Ruled lines.** Horizontal notebook ruling plus the red margin rule. Long,
straight, and at a fixed angle. Left in, they would dominate any slant or
stroke-direction statistic — every student's page would report the same
horizontal bias. Easy to filter: long straight near-horizontal runs.

**Bleed-through.** Faint ghost writing from the reverse side of the sheet,
clearly visible on both samples. This is *someone's* handwriting, but mirrored
and from a different page. Adaptive thresholding picks up some of it. Needs a
contrast floor so only confident ink counts.

**Page furniture.** Full pages include the spiral binding and the edge of the
facing page. Answer crops do not.

## Which input to use

| | Full pages | Answer crops |
|---|---|---|
| Printed text | none | none |
| Binding / page edge | present | absent |
| Ink per image | more | less |
| Guaranteed to be the student's answer | no | yes |
| Count available | 154 | 695 |

**Use answer crops as the primary input**, concatenating a worksheet's crops
into one fingerprint. They are pre-cleaned, there are 4.5x more of them, and
each is known to be answer content.

Keep full pages as a fallback for the 3 worksheets that have no crops, and as a
cross-check — if page and crop fingerprints of the same worksheet disagree, the
mask is picking up page furniture.

## Next

The gate, per [`../case1_identification.md`](../case1_identification.md): do a
student's pages from **different dates** sit closer to each other than to other
students' pages?

The fetched data supports it — 11/11 students have 6 worksheets across 3 dates.

One extra control is available and should be used. Every student did the same
worksheets on the same dates, so we can also measure *different student, same
worksheet*. If that comes out as tight as same-student-different-date, the
fingerprint is reading the worksheet rather than the hand.
