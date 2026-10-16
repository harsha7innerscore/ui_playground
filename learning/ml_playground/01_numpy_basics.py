"""NumPy fundamentals: the array, and why it is not a list.

Run:  .venv/bin/python 01_numpy_basics.py

Everything pandas does sits on top of what this file shows. A DataFrame column
is a NumPy array; a boolean filter is a NumPy mask; `df.mean()` is a NumPy
reduction along an axis.
"""

from __future__ import annotations

import time

import numpy as np

from lesson_utils import demo, note, run, section

SEED = 7


def section_creating_arrays() -> None:
    """An ndarray is a fixed-size block of one dtype, plus a shape describing how
    to read that block. Creation functions differ in what fills the block."""
    section("from Python objects")
    demo("np.array([1, 2, 3])", np.array([1, 2, 3]))
    demo("nested list -> 2-D", np.array([[1, 2, 3], [4, 5, 6]]))

    section("generated without a source list")
    demo("np.zeros((2, 3))", np.zeros((2, 3)))
    demo("np.ones(4, dtype=int)", np.ones(4, dtype=int))
    demo("np.full((2, 2), 7.5)", np.full((2, 2), 7.5))
    demo("np.arange(0, 10, 2)  # stop is exclusive", np.arange(0, 10, 2))
    demo("np.linspace(0, 1, 5)  # stop is inclusive", np.linspace(0, 1, 5))
    demo("np.eye(3)", np.eye(3))

    section("random, seeded")
    rng = np.random.default_rng(SEED)
    demo("rng.integers(0, 10, size=5)", rng.integers(0, 10, size=5))
    demo("rng.normal(loc=100, scale=15, size=5).round(2)", rng.normal(100, 15, 5).round(2))
    note(
        "Use np.random.default_rng(seed), not the legacy np.random.seed/np.random.rand "
        "global state. A Generator is explicit, independent, and safe to pass around."
    )


def section_dtype_and_shape() -> None:
    """dtype and shape are the two things to check first when an array misbehaves.
    dtype decides memory, precision and overflow; shape decides broadcasting."""
    a = np.arange(12)
    section("attributes")
    demo("a", a)
    demo("a.dtype / a.shape / a.ndim / a.size", (a.dtype, a.shape, a.ndim, a.size))
    demo("a.itemsize bytes per element", a.itemsize)
    demo("a.nbytes total", a.nbytes)

    section("reshape returns a view, not a copy")
    grid = a.reshape(3, 4)
    demo("a.reshape(3, 4)", grid)
    demo("grid.base is a", grid.base is a)
    demo("a.reshape(3, -1)  # -1 means 'infer this axis'", a.reshape(3, -1).shape)
    demo("grid.T", grid.T)
    demo("grid.ravel()", grid.ravel())

    section("dtype changes behaviour, not just storage")
    demo("np.array([1, 2, 3]) / 2  -> float64", np.array([1, 2, 3]) / 2)
    demo("int8 overflow: np.int8(127) + np.int8(1)", np.array([127], dtype=np.int8) + np.int8(1))
    demo("astype truncates toward zero", np.array([1.9, -1.9]).astype(int))
    demo("one str element makes the whole array str", np.array([1, 2, "3"]).dtype)
    note(
        "That last line is the single most common surprise when loading real data: "
        "one stray text value and the entire column stops being numeric."
    )


def section_indexing_and_views() -> None:
    """Slices share memory with their parent. Fancy and boolean indexing copy.
    Mutating a slice you thought was a copy is a classic silent bug."""
    a = np.arange(10)
    section("slicing: start:stop:step")
    demo("a", a)
    demo("a[2:7]", a[2:7])
    demo("a[::2]", a[::2])
    demo("a[::-1]", a[::-1])

    section("a slice is a view")
    view = a[2:5]
    view[:] = 99
    demo("after view[:] = 99, the parent changed", a)
    demo("use .copy() to detach", a[2:5].copy().base is None)

    section("2-D indexing: rows then columns")
    grid = np.arange(1, 13).reshape(3, 4)
    demo("grid", grid)
    demo("grid[1, 2]  # single element", grid[1, 2])
    demo("grid[1]     # whole row", grid[1])
    demo("grid[:, 1]  # whole column", grid[:, 1])
    demo("grid[0:2, 1:3]  # sub-block", grid[0:2, 1:3])

    section("boolean masks -- the basis of every filter you will ever write")
    scores = np.array([45, 88, 72, 91, 60, 99, 33])
    mask = scores >= 70
    demo("scores", scores)
    demo("scores >= 70", mask)
    demo("scores[mask]", scores[mask])
    demo("count passing: mask.sum()", mask.sum())
    demo("combine with & | ~ and parentheses", scores[(scores > 50) & (scores < 90)])
    demo("np.where(cond, a, b)", np.where(scores >= 70, "pass", "fail"))
    demo("np.where(cond) -> indices", np.where(scores >= 70)[0])
    note("Use & | ~, never and/or/not -- the Python keywords cannot act elementwise.")

    section("fancy indexing: pick positions in any order, with repeats")
    demo("scores[[0, 3, 3, 6]]", scores[[0, 3, 3, 6]])
    demo("sort by argsort", scores[np.argsort(scores)])
    demo("top 3 via argsort", scores[np.argsort(scores)[::-1][:3]])


def section_broadcasting() -> None:
    """Broadcasting stretches a smaller array across a larger one without copying
    it. Shapes align from the right; each axis must match or be 1."""
    section("scalar against array")
    a = np.arange(6).reshape(2, 3)
    demo("a", a)
    demo("a * 10", a * 10)

    section("row vector against matrix")
    row = np.array([100, 200, 300])
    demo("row.shape", row.shape)
    demo("a + row  # (2,3) + (3,) -> (2,3)", a + row)

    section("column vector against matrix")
    col = np.array([[10], [20]])
    demo("col.shape", col.shape)
    demo("a + col  # (2,3) + (2,1) -> (2,3)", a + col)

    section("outer product by broadcasting two orthogonal vectors")
    demo("np.arange(1,4)[:, None] * np.arange(1,5)", np.arange(1, 4)[:, None] * np.arange(1, 5))

    section("when it fails")
    try:
        np.zeros((2, 3)) + np.zeros((2, 4))
    except ValueError as exc:
        demo("(2,3) + (2,4) raises", exc)

    section("a real use: z-score each column")
    data = np.array([[70.0, 150.0], [85.0, 162.0], [60.0, 148.0], [95.0, 171.0]])
    z = (data - data.mean(axis=0)) / data.std(axis=0)
    demo("data (rows=students, cols=[score, height])", data)
    demo("column means", data.mean(axis=0).round(2))
    demo("z-scores", z.round(2))
    note("data.mean(axis=0) has shape (2,), which broadcasts across all 4 rows.")


def section_aggregation_and_axes() -> None:
    """axis=0 collapses rows and leaves one value per column; axis=1 collapses
    columns and leaves one value per row. This is the rule people get backwards."""
    marks = np.array([[78, 85, 90], [66, 71, 58], [92, 88, 95], [45, 52, 61]])
    section("the data: 4 students x 3 subjects")
    demo("marks", marks)

    section("axis")
    demo("marks.sum()         # everything", marks.sum())
    demo("marks.mean(axis=0)  # per subject", marks.mean(axis=0).round(2))
    demo("marks.mean(axis=1)  # per student", marks.mean(axis=1).round(2))
    demo("marks.max(axis=1)   # best subject per student", marks.max(axis=1))
    demo("marks.argmax(axis=1)  # which subject that was", marks.argmax(axis=1))

    section("keepdims keeps the result broadcastable")
    row_means = marks.mean(axis=1, keepdims=True)
    demo("shape without keepdims", marks.mean(axis=1).shape)
    demo("shape with keepdims", row_means.shape)
    demo("marks - row_means  # centre each student", (marks - row_means).round(1))

    section("other reductions")
    demo("std / var", (marks.std().round(3), marks.var().round(3)))
    demo("median per subject", np.median(marks, axis=0))
    demo("percentiles 25/50/75", np.percentile(marks, [25, 50, 75]))
    demo("cumsum of one row", marks[0].cumsum())
    demo("any / all", ((marks > 90).any(), (marks > 40).all()))


def section_missing_values() -> None:
    """NaN is a float that is not equal to itself. It poisons ordinary reductions,
    so NumPy ships nan-aware twins of them."""
    values = np.array([10.0, np.nan, 30.0, np.nan, 50.0])
    section("detection")
    demo("values", values)
    demo("values == np.nan  # never True", values == np.nan)
    demo("np.isnan(values)", np.isnan(values))
    demo("count missing", np.isnan(values).sum())

    section("reductions")
    demo("values.mean()  # contaminated", values.mean())
    demo("np.nanmean(values)", np.nanmean(values))
    demo("np.nansum / np.nanmax", (np.nansum(values), np.nanmax(values)))

    section("filling")
    filled = np.where(np.isnan(values), np.nanmean(values), values)
    demo("replace NaN with the mean", filled)
    demo("drop instead: values[~np.isnan(values)]", values[~np.isnan(values)])
    note("NaN only exists in float dtypes. An int array cannot hold one -- which is "
         "why pandas used to upcast int columns to float the moment a value went missing.")


def section_vectorization_pays() -> None:
    """The whole point. A vectorized expression runs one C loop over contiguous
    memory; the Python version runs an interpreter loop over boxed objects."""
    size = 2_000_000
    rng = np.random.default_rng(SEED)
    arr = rng.random(size)
    as_list = arr.tolist()

    start = time.perf_counter()
    loop_total = 0.0
    for value in as_list:
        loop_total += value * value
    loop_seconds = time.perf_counter() - start

    start = time.perf_counter()
    vector_total = float((arr * arr).sum())
    vector_seconds = time.perf_counter() - start

    section(f"sum of squares over {size:,} values")
    demo("python loop", f"{loop_total:.4f} in {loop_seconds * 1000:.1f} ms")
    demo("numpy vectorized", f"{vector_total:.4f} in {vector_seconds * 1000:.1f} ms")
    demo("speedup", f"{loop_seconds / vector_seconds:.0f}x")

    section("memory")
    demo("list of floats, bytes", f"{sum(map(lambda _: 8 + 16, as_list)):,} (plus pointer table)")
    demo("ndarray, bytes", f"{arr.nbytes:,}")
    note(
        "Rule of thumb: if you are writing a for-loop over an array, there is almost "
        "always an expression, a mask, or a ufunc that replaces it."
    )


def section_useful_operations() -> None:
    """A grab-bag of the functions that come up constantly in data work."""
    rng = np.random.default_rng(SEED)
    section("elementwise maths (ufuncs)")
    a = np.array([1.0, 4.0, 9.0, 16.0])
    demo("np.sqrt / np.log / np.exp", (np.sqrt(a), np.log(a).round(3), np.exp([0, 1]).round(3)))
    demo("np.round / floor / ceil", (np.round([1.45, 2.55], 1), np.floor([1.7]), np.ceil([1.2])))
    demo("np.clip(a, 2, 10)", np.clip(a, 2, 10))

    section("stacking and splitting")
    x, y = np.arange(3), np.arange(3) * 10
    demo("np.vstack", np.vstack([x, y]))
    demo("np.hstack", np.hstack([x, y]))
    demo("np.column_stack", np.column_stack([x, y]))
    demo("np.concatenate(axis=0) on 2-D", np.concatenate([np.ones((1, 3)), np.zeros((1, 3))]))

    section("set-like and counting helpers")
    labels = rng.choice(["math", "science", "english"], size=12)
    values, counts = np.unique(labels, return_counts=True)
    demo("labels", labels)
    demo("np.unique + counts", dict(zip(values, counts)))
    demo("np.bincount on small ints", np.bincount([0, 1, 1, 3, 3, 3]))
    demo("np.isin", np.isin(np.arange(6), [2, 4]))

    section("binning continuous values")
    minutes = np.array([15, 95, 240, 410, 620])
    edges = np.array([0, 60, 180, 360, 10_000])
    names = np.array(["<1h", "1-3h", "3-6h", "6h+"])
    demo("minutes", minutes)
    demo("np.digitize -> bucket index", np.digitize(minutes, edges) - 1)
    demo("labelled", names[np.digitize(minutes, edges) - 1])

    section("linear algebra, briefly")
    m = np.array([[2.0, 1.0], [1.0, 3.0]])
    demo("m @ identity", m @ np.eye(2))
    demo("np.linalg.inv(m)", np.linalg.inv(m).round(3))
    demo("solve m x = [5, 10]", np.linalg.solve(m, np.array([5.0, 10.0])).round(3))


SECTIONS = [
    section_creating_arrays,
    section_dtype_and_shape,
    section_indexing_and_views,
    section_broadcasting,
    section_aggregation_and_axes,
    section_missing_values,
    section_vectorization_pays,
    section_useful_operations,
]

if __name__ == "__main__":
    run(SECTIONS)
