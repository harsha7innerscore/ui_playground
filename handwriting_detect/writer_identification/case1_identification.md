# Case 1 — Identification: "Which student wrote this page?"

> Parent: [`README.md`](README.md) · [`../goal.md`](../goal.md)
> Sibling: [`case2_verification.md`](case2_verification.md)

## The question

Given one page of handwriting, and a set of students we have past work for,
name the student whose handwriting it is.

## Input

| What | Detail |
|---|---|
| Query page | One image |
| Enrolled students | For each: their past pages, and who submitted them |

Nothing else. No proctored writing sample is collected — a student's past
submissions supply the reference.

## What this needs that Case 2 does not

**Past pages per student.** Without history there is nothing to compare the
query against.

Minimum per student:

- 4+ worksheets
- spread across 3+ different dates

The dates matter. Pages from one worksheet share paper, scan settings and
lighting, so they look alike for reasons that have nothing to do with
handwriting. A reference built from a single sitting describes that sitting, not
the student.

Students below this bar return `INSUFFICIENT_HISTORY` rather than a weak guess.

## How it works

**Step 1 — Fingerprint every page.**

Each page becomes a list of numbers describing *how* it was written, not what it
says:

- slant — the angle letters lean
- stroke width — how thick the pen line is
- curviness — how rounded vs angular the letterforms are
- spacing — gaps between letters and words
- pen lifts — how often the writer breaks the stroke (print vs cursive)

Computed from the ink only. The paper is masked out first, reusing
`features.ink_paper_masks` from Problem 2.

No model. No training. Plain measurements.

**Step 2 — Build one reference per student.**

Average that student's past fingerprints → their centre.
Also record how much their own pages vary → their spread.

Spread matters. A very consistent writer gets a tight threshold. An erratic
writer gets a loose one. Without this, erratic writers get flagged constantly.

**Step 3 — Score the query page.**

Fingerprint it. Measure distance to every student's centre. Rank them.

Report the nearest match, and the gap to the second-nearest. A small gap means
the answer is a coin flip between two students and should be shown as such.

**Leave-one-out:** when scoring a page that is already in a student's history,
rebuild that student's reference without it first. Otherwise the page is being
compared against a reference it helped create, and everything looks like a
match.

## Output

```json
{
  "s3_url": "https://.../page_2_abc.jpg",
  "submitted_by": "student_C",
  "verdict": "MISMATCH",
  "confidence": 87,
  "looks_like": "student_A",
  "how_sure_about_A": 91,
  "runner_up": "student_B",
  "margin_to_runner_up": 34,
  "why": [
    "handwriting unlike C's other 14 submissions",
    "closely matches A's handwriting"
  ]
}
```

| Verdict | Meaning |
|---|---|
| `OK` | Matches the submitter's own past work |
| `MISMATCH` | Doesn't match their own work, and a likely writer was found |
| `UNKNOWN_WRITER` | Doesn't match their own work, no match found elsewhere |
| `INSUFFICIENT_HISTORY` | Too few past worksheets to judge |

## Two versions of this question — don't confuse them

**Closed-set** — "the writer is definitely one of these 30 students, which one?"
Easy. The system only has to rank.

**Open-set** — "the writer might be one of these 30, or might be nobody."
Much harder. The system has to decide *whether* the nearest match is close
enough to name at all.

Real use is open-set. Closed-set accuracy will look much better and must not be
quoted as the system's accuracy.

## How we know if it works

This case supplies its own ground truth, which is rare and valuable here.

Take a page whose writer we know. Hide it. Ask the system to name the writer.
Check the answer. Repeat across every page we have.

That gives a real accuracy number without needing a single labelled example of
cheating.

## The gate — run this before building anything downstream

One question decides whether the whole approach is viable: **do the fingerprints
track the hand, or the paper?**

Measure three distances:

| Comparison | Expected if fingerprints are real |
|---|---|
| Same student, same worksheet | closest |
| Same student, **different date** | **still clearly closer than the row below** |
| Different students | furthest |

The middle row is the entire test. If it sits down near "different students",
the fingerprints are measuring paper and lighting, and everything above is
meaningless.

The first row proves nothing on its own — same-worksheet pages match for
physical reasons regardless.

## Before even that — the 2-hour viability check

Our images come through a PDF-rasterisation path at 96 DPI. That path already
destroyed three of Problem 2's seven clues.

Three things to measure on existing cached images:

1. **Stroke width in pixels.** Below ~4px there is no letterform shape left to
   measure, only compression noise. No model fixes this — the information isn't
   in the file.
2. **Printed text on the page.** If worksheet question text sits alongside the
   handwriting and isn't removed, every student's fingerprint partly encodes the
   same printed font, which makes everyone look similar.
3. **Ink per page.** A page with three words has no stable fingerprint. Need a
   minimum-ink cutoff below which we decline to score.

## Known limits

- **Cold start.** Under ~4 worksheets, no usable reference.
- **Habitual offenders are invisible.** If C always submits A's work, C's
  reference *becomes* A's handwriting and nothing looks wrong. Catching this
  needs a separate check for students whose pages split into two distinct
  clusters.
- **Handwriting drifts.** Use a rolling window of recent work, not all history.
- **Pen, paper or injury changes** shift the fingerprint and cause false
  positives.
- **No direction.** Reports that a page matches A, never who copied whom.
- **Not an accusation.** Output is evidence for a teacher. These are claims about
  minors; every flag must be reviewable and appealable.

## Build order

1. Student-scoped fetch — 20–30 students, 4+ worksheets each, 3+ dates.
   (The current fetch script is task-scoped and gives the wrong shape.)
2. Viability check.
3. Fingerprint extractor.
4. **The gate.** Go/no-go for the whole problem.
5. References, scoring, attribution.
6. Threshold calibration by hand review.
