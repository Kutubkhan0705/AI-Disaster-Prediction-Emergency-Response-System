"""
Train an earthquake magnitude regressor (RandomForestRegressor) on earthquake/dataset.csv
Features: depth, historicalMagnitude, faultDistance, lat, lon
Target:   magnitude

Usage: python train.py
Output: earthquake_model.pkl
"""
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

FEATURES = ["depth", "historicalMagnitude", "faultDistance", "lat", "lon"]
TARGET = "magnitude"

def main():
    df = pd.read_csv("dataset.csv")
    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(n_estimators=200, max_depth=10, random_state=42)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)
    print(f"✅ Earthquake model MAE: {mae:.3f}, R²: {r2:.3f}")

    joblib.dump(model, "earthquake_model.pkl")
    print("💾 Saved model to earthquake_model.pkl")

if __name__ == "__main__":
    main()
