"""
Load flood_model.pkl and predict flood risk for given input features.
Can be run standalone (CLI) or imported by ml/api/main.py
"""
import sys
import json
import joblib
import pandas as pd

FEATURES = ["rainfall", "humidity", "riverLevel", "elevation", "temperature"]
MODEL_PATH = "flood_model.pkl"

_model = None

def load_model():
    global _model
    if _model is None:
        _model = joblib.load(MODEL_PATH)
    return _model

def predict(features: dict):
    model = load_model()
    row = pd.DataFrame([{k: features.get(k, 0) for k in FEATURES}])
    proba = model.predict_proba(row)[0][1]  # probability of flood_occurred == 1
    label = "High Risk" if proba >= 0.7 else "Moderate Risk" if proba >= 0.4 else "Low Risk"
    return {
        "label": label,
        "probability": round(float(proba), 4),
        "riskScore": round(float(proba), 4),
    }

if __name__ == "__main__":
    # Example CLI usage: python predict.py '{"rainfall": 200, "humidity": 80, "riverLevel": 6, "elevation": 50, "temperature": 28}'
    input_json = sys.argv[1] if len(sys.argv) > 1 else "{}"
    features = json.loads(input_json)
    print(json.dumps(predict(features), indent=2))
