"""
Train a flood risk classifier (RandomForest) on flood/dataset.csv
Features: rainfall, humidity, riverLevel, elevation, temperature
Target:   flood_occurred (0/1)

Usage: python train.py
Output: flood_model.pkl
"""
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib

FEATURES = ["rainfall", "humidity", "riverLevel", "elevation", "temperature"]
TARGET = "flood_occurred"

def main():
    df = pd.read_csv("dataset.csv")
    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(n_estimators=200, max_depth=8, random_state=42)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"Flood model accuracy: {acc:.3f}")
    print(classification_report(y_test, preds))

    joblib.dump(model, "flood_model.pkl")
    print("Saved model to flood_model.pkl")

if __name__ == "__main__":
    main()
