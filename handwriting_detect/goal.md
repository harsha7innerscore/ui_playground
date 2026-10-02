# Handwriting Detect — Goal

## Context

Students submit homework by uploading photos of handwritten papers. Sometimes the
person who submitted a paper is not the person who wrote it.

Concrete case we want to catch: students A, B and C are each assigned the same
homework. C submits a paper that A actually wrote. We want the system to surface
that C's submission is not in C's handwriting, and that it matches A's.

## Available input

For every submission we have exactly two things:

| Field | Description |
|---|---|
| `s3_url` | Location of the uploaded image |
| `student_id` | Who submitted it |

No EXIF guarantees, no task ID, no section, no OCR text, no device telemetry.
Anything beyond the two fields above must be derived from the image pixels or
from S3 object metadata (`LastModified`, object key) if it turns out to be
available.

## The two problems

These are separate questions with separate inputs and independent failure modes.
Both are worth solving. Neither one alone is sufficient.

---

### Problem 1 — Writer identification

**Question:** Whose handwriting is on this page?

**Granularity:** Per page.

**Approach:** Convert each image into a numeric "handwriting fingerprint" that
captures letter shape, slant, loop size, stroke spacing and connection style —
not the words themselves. Two pages written by the same person produce similar
fingerprints; two different writers produce dissimilar ones.

**Reference samples:** Derived from history, not collected separately. Each
student has many past submissions. Averaging the fingerprints of a student's own
past pages yields that student's handwriting signature. No proctored writing
sample or enrolment drive is required.

**Detection:** Fingerprint a new page, compare it against the submitter's own
signature. A large distance means the submitter did not write it. Then search
every other student's signature for the closest match to name the likely true
writer.

**Answers:** "C submitted this, but it is in A's handwriting."

---

### Problem 2 — Submission linking

**Question:** Are these two submissions connected to each other?

**Granularity:** Per pair of pages.

**Approach:** Compare pages directly against each other on physical and
photographic evidence, independent of handwriting:

- Near-duplicate image detection (the same scan uploaded twice)
- Paper surface match — ruling pitch, fold lines, creases, stains, paper colour
- Lighting match — illumination gradient direction and intensity
- Camera geometry match — page corner shape, perspective, crop
- JPEG encoder and quantisation table fingerprint
- Upload timing proximity

**Reference samples:** None needed. This compares pages only to other pages.
It works from the very first submission, with no history at all.

**Answers:** "These two papers were photographed in one sitting, on the same
desk, under the same lamp."

---

## What the system outputs

The system produces evidence, never a verdict. Final judgement belongs to a
teacher.

### Per-page record

```json
{
  "s3_url": "s3://.../hw_8841.jpg",
  "submitted_by": "student_C",
  "verdict": "MISMATCH",
  "confidence": 87,
  "looks_like": "student_A",
  "how_sure_about_A": 91,
  "why": [
    "handwriting unlike C's other 14 submissions",
    "closely matches A's handwriting",
    "same paper fold and desk lighting as A's submission",
    "uploaded 48 seconds after A's"
  ]
}
```

### Verdict values

| Verdict | Meaning |
|---|---|
| `OK` | Matches the submitter's own past work |
| `MISMATCH` | Does not match their own work, and a likely true writer was found |
| `UNKNOWN_WRITER` | Does not match their own work, no match found elsewhere |
| `INSUFFICIENT_HISTORY` | Too few past submissions to judge reliably |

### Reviewer view

Flagged page shown side by side with the candidate writer's page, with every
contributing signal listed in plain language. The teacher decides.

---

## Non-goals and known blind spots

- **Not an automatic accusation system.** Output is evidence for a human. Every
  flag must be reviewable, explainable and appealable. We are making claims about
  minors; false positives land on real students.
- **Cannot detect dictation.** If A dictated the answers and C wrote them in C's
  own hand, every pixel-level signal is clean. Catching this needs answer-text
  comparison, which requires OCR we do not currently have.
- **Cannot establish direction.** The system reports that A and C are linked, not
  who copied whom. Upload order is a weak hint, not proof.
- **Cold start.** A student with fewer than roughly five past submissions has no
  stable signature. These return `INSUFFICIENT_HISTORY` rather than a low-
  confidence guess.
- **Habitual offenders are invisible to Problem 1.** If C always submits A's
  work, C's derived signature becomes A's handwriting and nothing looks unusual.
  Detecting this needs a separate check for students whose pages split into two
  distinct clusters.

## Expected false positives

A student changing pen, phone, paper or desk will shift the signals. A broken
wrist changes handwriting outright. Thresholds must be calibrated against
hand-reviewed real results, not chosen theoretically.

## Modelling requirements

No model training is required for either problem, and critically, **no labelled
examples of past cheating are needed.**

- **Problem 2** uses no machine learning at all — image hashing, pixel statistics
  and metadata comparison via standard libraries.
- **Problem 1** has two options: a classic fingerprinting algorithm (local
  descriptors aggregated into a fixed-length vector), whose only fitting step is
  computing statistics over our own unlabelled images on CPU; or a published
  pretrained writer-identification model used for inference only. The classic
  route is the starting point; the pretrained model is a drop-in upgrade to the
  same pipeline if accuracy proves marginal.

## Gate before building anything downstream

Before scoring, attribution or any reviewer UI is built, one question must be
answered: **do a student's own pages produce fingerprints that are measurably
more similar to each other than to other students' pages?**

If yes, the fingerprints are capturing handwriting and the approach is viable.
If no, they are capturing something incidental such as paper texture or lighting,
and everything built on top would be meaningless.

This check is cheap and decides whether the rest of the project is worth funding.
