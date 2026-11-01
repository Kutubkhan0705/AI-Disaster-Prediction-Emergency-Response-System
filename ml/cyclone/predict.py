"""
Load cyclone_model.pkl and predict cyclone category for given input features.
Can be run standalone (CLI) or imported by ml/api/main.py
"""
import sys
import json
import joblib
import pandas as pd

FEATURES = ["windSpeed", "pressure", "seaSurfaceTemp", "humidity", "distanceToCoast", "lat", "lon"]
MODEL_PATH = "cyclone_model.pkl"

CATEGORY_LABELS = {
    0: "No Cyclone",
    1: "Tropical Storm",
    2: "Category 1",
    3: "Category 2",
    4: "Category 3",
    5: "Category 4/5 (Extreme)",
}

_model = None

def load_model():
    global _model
    if _model is None:
        _model = joblib.load(MODEL_PATH)
    return _model

def predict(features: dict):
    model = load_model()
    row = pd.DataFrame([{k: features.get(k, 0) for k in FEATURES}])
    category = int(model.predict(row)[0])
    proba = model.predict_proba(row)[0]
    risk_score = round(category / 5.0, 4)
    return {
        "label": CATEGORY_LABELS.get(category, "Unknown"),
        "category": category,
        "riskScore": risk_score,
        "probability": round(float(proba[category]), 4),
    }

if __name__ == "__main__":
    input_json = sys.argv[1] if len(sys.argv) > 1 else "{}"
    features = json.loads(input_json)
    print(json.dumps(predict(features), indent=2))
