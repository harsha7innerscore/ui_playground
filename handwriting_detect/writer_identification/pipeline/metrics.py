"""Distance metrics for comparing two handwriting fingerprints.

Why this module exists
----------------------
The fingerprint is not one homogeneous vector. It is two very different kinds
of evidence concatenated:

  - 5 scalars (stroke width x2, ink density, gap mean/std) -- real-valued
    measurements in unrelated units.
  - 144 Hinge bins -- a joint *probability distribution* that sums to 1.

gate.py's original metric z-scored all 149 dimensions together and took plain
Euclidean. That is the right treatment for the scalars and the wrong one for
the histogram, for a specific and damaging reason: z-scoring divides each
dimension by its standard deviation across the corpus. Hinge mass is very
unevenly spread -- a few bins carry most of it, many sit near zero. Dividing a
near-empty bin by its own tiny standard deviation inflates it to the same
weight as a bin carrying real signal, so the metric ends up dominated by the
noisiest, least informative part of the histogram.

The writer-identification literature compares these histograms with chi-square
or Hellinger/Bhattacharyya distances on the *raw* distribution instead. This
module implements those, plus the original metric, so they can be measured
against each other on identical data rather than argued about.

Everything here is a pure function of two fingerprint vectors. No fitting, no
state, no network.
"""

import warnings

import numpy as np

import features

# Apple's Accelerate BLAS raises divide-by-zero / overflow / invalid flags from
# inside matmul on this hardware even when every input and every output is
# finite -- verified by comparing the matmul result against np.einsum and an
# explicit dot-product loop, which agree to 4e-16. The flags come from padding
# lanes in the vectorized kernel, not from the arithmetic we asked for.
# Suppressed narrowly, by message, so a genuine numerical problem elsewhere
# still surfaces.
warnings.filterwarnings(
    "ignore", message=".*encountered in matmul", category=RuntimeWarning
)

N_SCALARS = len(features.SCALAR_FIELDS)


def split(vector):
    """149-dim fingerprint -> (5 scalars, 144 hinge bins)."""
    return vector[:N_SCALARS], vector[N_SCALARS:]


def _renormalize(histogram):
    """Re-impose sum-to-1 after averaging or NaN-dropping.

    Hinge bins leave features.py already L1-normalized, but a worksheet-level
    or signature-level vector is the *mean* of several page vectors, and NaN
    handling can drop bins, so the sum is no longer guaranteed. Every metric
    below assumes a probability distribution; this makes that true.
    """
    histogram = np.where(np.isnan(histogram), 0.0, histogram)
    total = histogram.sum()
    return histogram / total if total > 0 else histogram


# --- histogram distances ------------------------------------------------


def chi2(p, q):
    """Chi-square distance: sum (p-q)^2 / (p+q), bins where both are 0 skipped.

    The standard histogram comparison in this literature. Divides each bin's
    squared difference by the mass actually present in that bin, so a large
    absolute difference in a heavily-populated bin counts for more than the
    same difference between two nearly-empty bins -- the exact opposite of
    what z-scoring does.
    """
    p, q = _renormalize(p), _renormalize(q)
    denominator = p + q
    nonzero = denominator > 0
    if not nonzero.any():
        return 0.0
    return float(np.sum((p[nonzero] - q[nonzero]) ** 2 / denominator[nonzero]))


def hellinger(p, q):
    """Hellinger distance: Euclidean distance between the square roots.

    The square root is a variance-stabilizing transform for count data -- it
    pulls up small bins and compresses large ones, so a handful of dominant
    bins stop monopolizing the comparison. The same trick appears as "power
    normalization" in VLAD and Fisher-vector encodings, where it is one of the
    larger sources of reported gain.
    """
    p, q = _renormalize(p), _renormalize(q)
    return float(np.sqrt(np.sum((np.sqrt(p) - np.sqrt(q)) ** 2)) / np.sqrt(2))


def bhattacharyya(p, q):
    """-log of the overlap between the two distributions."""
    p, q = _renormalize(p), _renormalize(q)
    overlap = float(np.sum(np.sqrt(p * q)))
    return float(-np.log(max(overlap, 1e-12)))


def manhattan(p, q):
    """L1 / total-variation distance. Simple, robust to single-bin spikes."""
    p, q = _renormalize(p), _renormalize(q)
    return float(np.sum(np.abs(p - q)))


def cosine(p, q):
    """1 - cosine similarity. Ignores overall magnitude, compares shape only."""
    p, q = _renormalize(p), _renormalize(q)
    norm = np.linalg.norm(p) * np.linalg.norm(q)
    return 1.0 - float(np.dot(p, q) / norm) if norm > 0 else 1.0


def euclidean(p, q):
    """Plain L2 on the raw histogram -- the control for 'was it the z-scoring
    that hurt, or was Euclidean itself the problem?'
    """
    p, q = _renormalize(p), _renormalize(q)
    return float(np.sqrt(np.sum((p - q) ** 2)))


HISTOGRAM_METRICS = {
    "chi2": chi2,
    "hellinger": hellinger,
    "bhattacharyya": bhattacharyya,
    "manhattan": manhattan,
    "cosine": cosine,
    "euclidean_raw": euclidean,
}


# --- scalar distance ----------------------------------------------------


def scalar_distance(a, b):
    """NaN-safe Euclidean over the scalar block.

    Callers pass scalars already z-scored across the corpus -- unlike the
    histogram, these genuinely are unrelated measurements in different units
    (pixels, ratios, pixel gaps), so putting them on a common scale is correct
    here even though it is wrong for the histogram.
    """
    shared = ~(np.isnan(a) | np.isnan(b))
    if not shared.any():
        return None
    difference = a[shared] - b[shared]
    return float(np.sqrt(np.sum(difference ** 2) * (len(a) / shared.sum())))


# --- fusion -------------------------------------------------------------


class FusedMetric:
    """Distance over the whole fingerprint: one metric for the histogram, one
    for the scalars, combined as a weighted sum.

    The two parts are not on a common scale, so they are combined after each is
    divided by its own corpus-wide mean distance (set by calibrate()). Without
    that, the weight would mean something different for every metric and the
    comparison between metrics would be measuring the accident of their units.

    scalar_weight=0 drops the scalars entirely, which is the test of whether
    they contribute anything at all.
    """

    def __init__(self, histogram_metric="chi2", scalar_weight=0.0):
        self.histogram_metric_name = histogram_metric
        self.histogram_metric = HISTOGRAM_METRICS[histogram_metric]
        self.scalar_weight = scalar_weight
        self.histogram_scale = 1.0
        self.scalar_scale = 1.0

    @property
    def name(self):
        return f"{self.histogram_metric_name}+scalars@{self.scalar_weight:g}"

    def calibrate(self, vectors, sample_pairs=2000, seed=0):
        """Set each part's scale from the corpus so the weight is meaningful."""
        if self.scalar_weight == 0:
            return self
        rng = np.random.default_rng(seed)
        n = len(vectors)
        if n < 2:
            return self
        i = rng.integers(0, n, sample_pairs)
        j = rng.integers(0, n, sample_pairs)

        histogram_distances, scalar_distances = [], []
        for a_idx, b_idx in zip(i, j):
            if a_idx == b_idx:
                continue
            a_scalars, a_histogram = split(vectors[a_idx])
            b_scalars, b_histogram = split(vectors[b_idx])
            histogram_distances.append(self.histogram_metric(a_histogram, b_histogram))
            d = scalar_distance(a_scalars, b_scalars)
            if d is not None:
                scalar_distances.append(d)

        if histogram_distances:
            self.histogram_scale = max(float(np.mean(histogram_distances)), 1e-12)
        if scalar_distances:
            self.scalar_scale = max(float(np.mean(scalar_distances)), 1e-12)
        return self

    def __call__(self, a, b):
        a_scalars, a_histogram = split(a)
        b_scalars, b_histogram = split(b)
        distance = self.histogram_metric(a_histogram, b_histogram) / self.histogram_scale
        if self.scalar_weight:
            d = scalar_distance(a_scalars, b_scalars)
            if d is not None:
                distance += self.scalar_weight * (d / self.scalar_scale)
        return distance


# --- corpus-fitted transforms -------------------------------------------
#
# Measured result that motivated this section: chi-square and Hellinger on the
# raw histogram both scored *below* the original z-scored-Euclidean metric
# (37.3% and 38.7% vs 40.8% top-1). The prediction that z-scoring was simply
# wrong for a histogram did not survive contact with the data.
#
# The reading that fits the numbers: z-scoring a histogram is two things at
# once. It does flatten the distribution's shape -- but it is also diagonal
# whitening, and decorrelating the dimensions is one of the larger documented
# gains in VLAD/Fisher-vector writer-ID pipelines. The whitening was evidently
# worth more than the shape damage cost.
#
# That points at the recipe those pipelines actually use, which is neither of
# the two things tested: power-normalize (square root), then L2-normalize,
# *then* whiten. Square root stabilizes the variance of count data so no
# handful of bins dominates; whitening then removes correlation between bins.
# Applied in that order they are complementary rather than alternatives.
#
# These fit on the corpus, so they are transforms applied to every vector
# before a plain Euclidean comparison, not pairwise distance functions.


class VectorTransform:
    """Fit on the corpus, then map each fingerprint before Euclidean distance.

    power_normalize   square-root the histogram bins (variance stabilization)
    l2_normalize      scale the histogram block to unit length
    whiten            z-score every dimension ("diagonal"), or PCA-whiten
                      ("pca", which also decorrelates across bins)
    """

    def __init__(self, power_normalize=False, l2_normalize=False,
                 whiten=None, pca_dims=None, scalar_weight=1.0):
        self.power_normalize = power_normalize
        self.l2_normalize = l2_normalize
        self.whiten = whiten
        self.pca_dims = pca_dims
        self.scalar_weight = scalar_weight
        self._mean = None
        self._std = None
        self._components = None

    @property
    def name(self):
        parts = []
        if self.power_normalize:
            parts.append("sqrt")
        if self.l2_normalize:
            parts.append("l2")
        if self.whiten == "diagonal":
            parts.append("zscore")
        elif self.whiten == "pca":
            parts.append(f"pca{self.pca_dims or 'full'}")
        if not parts:
            parts.append("raw")
        if self.scalar_weight != 1.0:
            parts.append(f"sw{self.scalar_weight:g}")
        return "+".join(parts)

    def _pre(self, vector):
        """Per-vector steps, before any corpus-fitted step."""
        scalars, histogram = split(vector)
        histogram = _renormalize(histogram)
        if self.power_normalize:
            histogram = np.sqrt(histogram)
        if self.l2_normalize:
            norm = np.linalg.norm(histogram)
            if norm > 0:
                histogram = histogram / norm
        scalars = np.where(np.isnan(scalars), 0.0, scalars) * self.scalar_weight
        return np.concatenate([scalars, histogram])

    def fit(self, vectors):
        stacked = np.vstack([self._pre(v) for v in vectors])
        self._mean = stacked.mean(axis=0)
        centered = stacked - self._mean

        if self.whiten == "diagonal":
            std = centered.std(axis=0)
            self._std = np.where(std > 1e-9, std, 1.0)
        elif self.whiten == "pca":
            # SVD rather than an explicit covariance eigendecomposition: the
            # dimensionality (149) is far below the sample count, and SVD is
            # the numerically stabler route to the same components.
            _, singular, vt = np.linalg.svd(centered, full_matrices=False)
            keep = self.pca_dims or len(singular)
            self._components = vt[:keep]
            # epsilon guards directions with almost no variance, which whitening
            # would otherwise amplify into pure noise
            self._std = np.maximum(singular[:keep] / np.sqrt(len(centered)), 1e-6)
        return self

    def transform(self, vector):
        out = self._pre(vector) - self._mean
        if self.whiten == "diagonal":
            out = out / self._std
        elif self.whiten == "pca":
            out = (self._components @ out) / self._std
        return out


def euclidean_distance(a, b):
    return float(np.sqrt(np.sum((a - b) ** 2)))


TRANSFORMS = {
    "raw": lambda: VectorTransform(),
    "zscore": lambda: VectorTransform(whiten="diagonal"),
    "sqrt+zscore": lambda: VectorTransform(power_normalize=True, whiten="diagonal"),
    "sqrt+l2+zscore": lambda: VectorTransform(power_normalize=True, l2_normalize=True, whiten="diagonal"),
    "sqrt+l2": lambda: VectorTransform(power_normalize=True, l2_normalize=True),
    "pca": lambda: VectorTransform(whiten="pca"),
    "sqrt+pca": lambda: VectorTransform(power_normalize=True, whiten="pca"),
    "sqrt+l2+pca": lambda: VectorTransform(power_normalize=True, l2_normalize=True, whiten="pca"),
    "sqrt+l2+pca64": lambda: VectorTransform(power_normalize=True, l2_normalize=True, whiten="pca", pca_dims=64),
    "sqrt+l2+pca32": lambda: VectorTransform(power_normalize=True, l2_normalize=True, whiten="pca", pca_dims=32),
}
