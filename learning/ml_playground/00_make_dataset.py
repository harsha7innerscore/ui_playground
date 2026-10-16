"""Generate data/students_raw.csv -- a deliberately messy dataset.

Every defect injected here is one that script 03 (data cleaning) has to repair:
missing sentinels, inconsistent categories, numbers stored as text, mixed date
formats, duplicate rows and impossible values. Output is reproducible.
"""

from pathlib import Path

import numpy as np
import pandas as pd

SEED = 7
N_STUDENTS = 400
DATA_DIR = Path(__file__).parent / "data"
RAW_CSV = DATA_DIR / "students_raw.csv"

CITIES = ["Hyderabad", "Bengaluru", "Chennai", "Pune", "Delhi"]
SCHOOLS = ["Oakridge", "Delhi Public School", "Narayana", "Chirec", "Sri Chaitanya"]
DEVICES = ["android", "ios", "web"]
SUBJECTS = ["math_score", "science_score", "english_score"]


def build_clean_frame(rng: np.random.Generator) -> pd.DataFrame:
    """The dataset as it would look if nothing had gone wrong."""
    grade = rng.integers(6, 11, size=N_STUDENTS)
    study_minutes = rng.gamma(shape=4.0, scale=45.0, size=N_STUDENTS).round()
    attendance = np.clip(rng.normal(88, 9, size=N_STUDENTS), 40, 100).round(1)

    # Scores are driven by study time and attendance so later correlation and
    # groupby lessons have real signal to find, not noise.
    base = 35 + 0.055 * study_minutes + 0.25 * attendance
    scores = {
        subject: np.clip(base + rng.normal(offset, 9, size=N_STUDENTS), 0, 100).round(1)
        for subject, offset in zip(SUBJECTS, (0.0, -3.5, 2.0))
    }

    enrolled = pd.to_datetime("2025-04-01") + pd.to_timedelta(
        rng.integers(0, 300, size=N_STUDENTS), unit="D"
    )

    return pd.DataFrame(
        {
            "student_id": [f"STU{i:04d}" for i in range(1, N_STUDENTS + 1)],
            "name": [f"Student {i:03d}" for i in range(1, N_STUDENTS + 1)],
            "school": rng.choice(SCHOOLS, size=N_STUDENTS),
            "city": rng.choice(CITIES, size=N_STUDENTS),
            "grade": grade,
            "gender": rng.choice(["F", "M"], size=N_STUDENTS),
            "device": rng.choice(DEVICES, size=N_STUDENTS, p=[0.5, 0.2, 0.3]),
            "enrolled_on": enrolled,
            "study_minutes": study_minutes,
            "attendance_pct": attendance,
            **scores,
        }
    )


def corrupt(df: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    """Inject the defects. Each block maps to one cleaning step in script 03."""
    df = df.astype({col: "object" for col in df.columns})

    def positions(count: int) -> np.ndarray:
        return rng.choice(df.index, size=count, replace=False)

    # 1. Missing values wearing different disguises.
    for column, sentinel in [
        ("attendance_pct", ""),
        ("study_minutes", "N/A"),
        ("math_score", None),
        ("science_score", "null"),
        ("device", "   "),
        ("city", "-"),
    ]:
        df.loc[positions(28), column] = sentinel

    # 2. Categorical values that mean the same thing but do not compare equal.
    for idx in positions(70):
        df.loc[idx, "city"] = rng.choice([" delhi", "DELHI ", "Delhi", "hyderabad", "HYDERABAD"])
    for idx in positions(60):
        df.loc[idx, "device"] = rng.choice(["Android", "ANDROID", "iOS", "Web ", " web"])
    for idx in positions(50):
        df.loc[idx, "gender"] = rng.choice(["female", "Male", "f", "m", "FEMALE"])

    # 3. Numbers stored as text: percent signs, thousands separators, stray spaces.
    for idx in positions(45):
        value = df.loc[idx, "attendance_pct"]
        if isinstance(value, float):
            df.loc[idx, "attendance_pct"] = f"{value}%"
    for idx in positions(40):
        value = df.loc[idx, "study_minutes"]
        if isinstance(value, float):
            df.loc[idx, "study_minutes"] = f"{value:,.0f} min"

    # 4. Dates in three incompatible formats.
    for idx in positions(120):
        stamp = df.loc[idx, "enrolled_on"]
        fmt = rng.choice(["%d/%m/%Y", "%d-%b-%Y", "%Y/%m/%d"])
        df.loc[idx, "enrolled_on"] = stamp.strftime(fmt)

    # 5. Impossible values -- sentinels and data-entry slips, not real outliers.
    for idx in positions(12):
        df.loc[idx, rng.choice(SUBJECTS)] = 999
    for idx in positions(8):
        df.loc[idx, "study_minutes"] = -60
    for idx in positions(6):
        df.loc[idx, "grade"] = 0

    # 6. Genuine statistical outliers -- real students who study enormously.
    for idx in positions(10):
        df.loc[idx, "study_minutes"] = float(rng.integers(900, 1400))

    # 7. Untrimmed free text.
    for idx in positions(40):
        df.loc[idx, "name"] = f"  {df.loc[idx, 'name']}  "

    # 8. Exact duplicate rows, appended at the end.
    duplicates = df.loc[positions(25)].copy()
    df = pd.concat([df, duplicates], ignore_index=True)

    # 9. Shuffle so the duplicates are not conveniently at the bottom.
    return df.sample(frac=1.0, random_state=SEED).reset_index(drop=True)


def main() -> None:
    rng = np.random.default_rng(SEED)
    DATA_DIR.mkdir(exist_ok=True)

    messy = corrupt(build_clean_frame(rng), rng)
    messy.to_csv(RAW_CSV, index=False)

    print(f"wrote {RAW_CSV.relative_to(Path.cwd())}  rows={len(messy)}  cols={messy.shape[1]}")
    print("\nfirst 5 rows as stored on disk:")
    print(RAW_CSV.read_text().splitlines()[0])
    for line in RAW_CSV.read_text().splitlines()[1:6]:
        print(line)


if __name__ == "__main__":
    main()
