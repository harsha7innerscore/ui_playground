# Decisions

Technical decisions made while implementing `ml_playground`. Appended to as the project grows.

---

## Add scikit-learn as a dependency (scripts 06-13)

**Decision:** Added `scikit-learn>=1.5,<2.0` to `requirements.txt` and installed it into the project `.venv`.

**Reasoning:** Lessons 06-13 cover supervised/unsupervised learning, regression, classification, decision trees,
k-means, train/val/test splitting, and precision/recall/F1. scikit-learn is the standard, well-documented
implementation of all of these and lets the lessons focus on the concepts rather than re-deriving optimizers.

**Technical justification:** scikit-learn's estimator API (`.fit` / `.predict` / `.predict_proba` / `.score`) is
consistent across `LinearRegression`, `LogisticRegression`, `DecisionTreeClassifier/Regressor`, and `KMeans`,
so one mental model covers every lesson. It also ships `train_test_split`, `StandardScaler`, and the full
`sklearn.metrics` module needed for lesson 12 and 13.

**Alternatives considered:** Implementing gradient descent and the metrics by hand throughout was rejected —
08_linear_regression.py does fit a line by hand with `np.polyfit` once, specifically to show it matches
scikit-learn's result, but hand-deriving every algorithm would bloat each lesson and obscure the concept being
taught. `statsmodels` was considered for its richer regression diagnostics but rejected to keep one ML library
across all eight lessons instead of two with overlapping purposes.

**Impact:** Pulls in `scipy`, `joblib`, `threadpoolctl`, `cloudpickle`, and `narwhals` as transitive dependencies
(all pinned by scikit-learn's own resolver). No impact on scripts 00-05, which don't import it.

---

## Reuse `data/students_clean.csv` instead of synthetic toy arrays

**Decision:** Every new lesson (06-13) loads the same `data/students_clean.csv` produced by `03_data_cleaning.py`,
rather than generating a fresh toy dataset per script.

**Reasoning:** This matches the project's existing architecture decision (see `CLAUDE.md`): "One messy dataset
threaded through every script, so cleaning, exploration and plotting operate on the same domain instead of toy
arrays invented per file." Extending that to the ML lessons means a learner recognizes `study_minutes`,
`attendance_pct`, and `average_score` from lessons 02-05 and sees ML applied to data they already understand,
including its real noise and weak correlations — e.g. 07_regression_vs_classification.py and
08_linear_regression.py both surface a negative R² on `average_score`, which is an honest finding about this
dataset, not a contrived failure.

**Alternatives considered:** `sklearn.datasets` toy sets (iris, diabetes) are cleaner and would produce prettier
metrics, but would break continuity with the rest of the playground and hide what real, noisy, weakly-predictive
data looks like.

**Impact:** None of 00-05 needed changes. Scripts 06-13 depend on `data/students_clean.csv` existing, same as
04 and 05 already did.

---

## Derive ad-hoc binary targets instead of using the `performance` column directly

**Decision:** Lessons 07, 09, 10, 12, and 13 derive their own classification targets —
`passed = average_score >= median` (07, 09, 10) and `at_risk = average_score < 60` (13) — rather than using the
existing `performance` categorical column (`needs work` / `fair` / `good` / `excellent`).

**Reasoning:** `performance` is severely imbalanced in this dataset (2 `needs work`, 3 `excellent`, 97 `good`,
292 `fair` — checked via `df['performance'].value_counts()`), which is too few positive examples for a
stratified `train_test_split` in a binary classifier and would make lessons 09 and 10 mostly about degenerate
edge cases rather than the algorithm being taught. `passed` (median split, ~50/50) gives clean binary-
classification lessons for logistic regression and decision trees; `at_risk` (average_score < 60, ~21.6%
positive) was chosen specifically for lesson 13 because it *is* imbalanced enough to make the "accuracy lies on
imbalanced classes" point concretely, without being as extreme as `performance`.

**Alternatives considered:** Using `performance` directly (rejected — too imbalanced to split or to teach a
first classification example on) and collapsing `performance` into `needs work`/`fair` vs `good`/`excellent`
(rejected — would still be derived from a column designed for descriptive reporting, not prediction, and offers
no advantage over a clear, data-driven threshold on `average_score`).

**Impact:** Each lesson computes its own target column locally in `load()`; nothing is written back to
`data/students_clean.csv`.

---

## Feature scaling: applied for logistic regression and k-means, not for trees

**Decision:** `StandardScaler` is fit on the training split and applied before `LogisticRegression` (09, 07) and
`KMeans` (11, 06), but never before `DecisionTreeClassifier`/`DecisionTreeRegressor` (10, 12).

**Reasoning:** Logistic regression's coefficients and k-means' distance calculations are scale-sensitive —
`study_minutes` (tens to low thousands) would dominate `attendance_pct` (0-100) if left unscaled. Decision
trees split on a per-feature threshold and are invariant to any monotonic transform of a feature, so scaling
would add a step without changing the model's splits or predictions.

**Technical justification:** This is scikit-learn's own stated behavior for each estimator family, not a
project-specific convention — documented explicitly in lesson 11 (`section_scale_matters`) and lesson 10's
docstring.

**Alternatives considered:** Scaling everything uniformly for consistency was considered and rejected — it
would contradict the actual lesson content (10_decision_trees.py explicitly teaches that trees don't need it),
and would be a misleading thing to model as "best practice."

**Impact:** Scaler objects are fit fresh inside each lesson function on that function's own train split; no
shared/pickled scaler exists across scripts.

---

## Three-way split via two `train_test_split` calls, not `cross_val_score`

**Decision:** 12_train_val_test_overfitting.py implements the train/validation/test split as
`train_test_split` twice (60/40, then the 40% split 50/50) rather than using k-fold cross-validation.

**Reasoning:** The lesson's purpose is to make the train/validation/test *mechanics* visible and nameable
(three concrete DataFrames, three row counts, three distinct roles), which a single `cross_val_score` call
would hide behind an aggregate number. The explicit split is also what the lesson's own output narrates step by
step (row counts, then per-depth MAE table, then one final test score).

**Alternatives considered:** `sklearn.model_selection.cross_val_score` / `GridSearchCV` would be the realistic
choice in production code and give a less noisy depth estimate from a small dataset, but was rejected here
specifically because it collapses the train/validation distinction the lesson exists to teach.

**Impact:** None outside this script. The random seed (`random_state=0`) is fixed on both splits for
reproducible output across runs, consistent with the project's existing seeding convention.

---

## `class_weight="balanced"` instead of resampling, for the imbalanced precision/recall example

**Decision:** 13_precision_recall_f1.py fits `LogisticRegression(class_weight="balanced")` rather than
oversampling the minority (`at_risk`) class.

**Reasoning:** `class_weight="balanced"` is a one-argument, dependency-free way to keep the model from
collapsing to "always predict the majority class" (shown explicitly via `DummyClassifier` in
`section_why_accuracy_lies_on_imbalanced_classes`), which is exactly the failure mode the lesson needs a
contrast against.

**Alternatives considered:** SMOTE/oversampling (`imbalanced-learn`) would be the more realistic production
technique but was rejected to avoid adding a new dependency for one lesson, and because reweighting the loss is
simpler to explain inline than a synthetic-sampling algorithm.

**Impact:** Confined to `section_the_confusion_matrix` and `section_precision_recall_f1_by_hand` in that one
script.
