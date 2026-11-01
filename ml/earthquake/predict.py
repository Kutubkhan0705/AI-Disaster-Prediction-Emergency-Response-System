"""
Load earthquake_model.pkl and predict expected magnitude / risk for given input features.
Can be run standalone (CLI) or imported by ml/api/main.py
"""
import sys
import json
import joblib
import pandas as pd

FEATURES = ["depth", "historicalMagnitude", "faultDistance", "lat", "lon"]
MODEL_PATH = "earthquake_model.pkl"

_model = None

def load_model():
    global _model
    if _model is None:
        _model = joblib.load(MODEL_PATH)
    return _model

def predict(features: dict):
    model = load_model()
    row = pd.DataFrame([{k: features.get(k, 0) for k in FEATURES}])
    magnitude = float(model.predict(row)[0])
    risk_score = min(max(magnitude / 9.0, 0), 1)  # normalize to 0-1
    label = (
        "Severe" if magnitude >= 7 else
        "High" if magnitude >= 5.5 else
        "Moderate" if magnitude >= 4 else
        "Low"
    )
    return {
        "label": label,
        "magnitude": round(magnitude, 2),
        "riskScore": round(risk_score, 4),
    }

if __name__ == "__main__":
    input_json = sys.argv[1] if len(sys.argv) > 1 else "{}"
    features = json.loads(input_json)
    print(json.dumps(predict(features), indent=2))
