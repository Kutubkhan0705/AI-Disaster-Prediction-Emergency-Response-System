"""
Train a cyclone category classifier (RandomForest) on cyclone/dataset.csv
Features: windSpeed, pressure, seaSurfaceTemp, humidity, distanceToCoast, lat, lon
Target:   cyclone_category (0-5)

Usage: python train.py
Output: cyclone_model.pkl
"""
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

FEATURES = ["windSpeed", "pressure", "seaSurfaceTemp", "humidity", "distanceToCoast", "lat", "lon"]
TARGET = "cyclone_category"

def main():
    csv_path = "dataset.csv"
    if not os.path.exists(csv_path):
        print("dataset.csv not found — generating it now...")
        import dataset  # runs dataset.py

    df = pd.read_csv(csv_path)
    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"Cyclone model accuracy: {acc:.3f}")
    print(classification_report(y_test, preds))

    joblib.dump(model, "cyclone_model.pkl")
    print("Saved model to cyclone_model.pkl")

if __name__ == "__main__":
    main()
