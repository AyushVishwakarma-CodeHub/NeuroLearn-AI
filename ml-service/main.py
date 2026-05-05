from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import numpy as np
import os

app = FastAPI()

class StudyStats(BaseModel):
    last_score: float
    study_duration: float
    total_reviews: int
    last_gap_days: int

# Load training data
dataset_path = os.path.join(os.path.dirname(__file__), 'study_data.csv')
if os.path.exists(dataset_path):
    df = pd.read_csv(dataset_path)
    X = df[['last_score', 'study_duration', 'total_reviews', 'last_gap_days']].values
    y = df['days_until_next_revision'].values
    print(f"Loaded dataset with {len(df)} records for ML Model.")
else:
    print("Warning: study_data.csv not found, using small fallback dataset.")
    X = np.array([[100, 60, 5, 2], [50, 20, 1, 1], [80, 45, 3, 3], [30, 15, 0, 0]])
    y = np.array([10, 1, 5, 0])

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

@app.get("/")
def home():
    return {"message": "NeuroLearn ML Service Running"}

@app.post("/predict")
def predict_revision(stats: StudyStats):
    features = np.array([[stats.last_score, stats.study_duration, stats.total_reviews, stats.last_gap_days]])
    prediction = model.predict(features)
    return {"days_until_next_revision": max(0, round(float(prediction[0]), 2))}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
