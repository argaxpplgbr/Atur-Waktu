from typing import Literal

import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict, Field
from sklearn.ensemble import RandomForestRegressor

app = FastAPI(title="StudyFlow Recommender", version="1.0.0")
camel = lambda s: s.split("_")[0] + "".join(p.title() for p in s.split("_")[1:])
model: RandomForestRegressor | None = None


class StudyInput(BaseModel):
    model_config = ConfigDict(alias_generator=camel, populate_by_name=True)
    available_minutes: int = Field(ge=10, le=180)
    energy_level: Literal[1, 2, 3, 4, 5]
    distraction_level: Literal[1, 2, 3, 4, 5]


class StudyOutput(BaseModel):
    model_config = ConfigDict(alias_generator=camel, populate_by_name=True)
    focus_minutes: int
    break_minutes: int
    model: str
    note: str


def synthetic_data(rows: int = 3000, seed: int = 42):
    rng = np.random.default_rng(seed)
    available = rng.integers(10, 181, rows)
    energy = rng.integers(1, 6, rows)
    distraction = rng.integers(1, 6, rows)
    # Aturan buatan untuk latihan regresi, bukan temuan tentang produktivitas.
    target = 18 + energy * 5 - distraction * 3 + available * 0.20 + rng.normal(0, 4, rows)
    target = np.clip(target, 10, np.minimum(available, 60))
    return np.column_stack([available, energy, distraction]), target


@app.on_event("startup")
def train_model():
    global model
    x, y = synthetic_data()
    model = RandomForestRegressor(n_estimators=100, max_depth=9, random_state=42, n_jobs=1)
    model.fit(x, y)


@app.get("/health")
def health():
    return {"status": "ok", "model_trained": model is not None}


@app.post("/recommend", response_model=StudyOutput)
def recommend(data: StudyInput):
    assert model is not None, "Model belum dilatih saat startup"
    features = np.array([[data.available_minutes, data.energy_level, data.distraction_level]])
    focus = int(round(float(model.predict(features)[0]) / 5) * 5)
    focus = max(10, min(focus, 60, data.available_minutes))
    pause = 10 if focus >= 45 else 5
    return StudyOutput(
        focusMinutes=focus, breakMinutes=pause, model="Random Forest · data sintetis",
        note="Saran demo dari data buatan. Sesuaikan durasi dengan kenyamananmu.",
    )
