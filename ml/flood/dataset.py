"""
Generate a realistic flood dataset.
rainfall  = 7-day cumulative (mm) — matches what Open-Meteo daily sum returns
riverLevel = 0-10 m
elevation  = 0-500 m
humidity   = 40-100 %
temperature = 15-42 °C

Flood logic (realistic):
  HIGH risk:  rainfall>150 AND riverLevel>6 AND elevation<100
  MOD risk:   rainfall>80  AND (riverLevel>4 OR elevation<150)
  LOW risk:   everything else

Run: python dataset.py
"""
import numpy as np
import pandas as pd

np.random.seed(42)
N = 2000

rainfall    = np.random.uniform(0, 350, N)    # 7-day cumulative mm
humidity    = np.random.uniform(30, 100, N)
river_level = np.random.uniform(0, 10, N)
elevation   = np.random.uniform(0, 500, N)
temperature = np.random.uniform(15, 42, N)

def label(r, h, rl, el, t):
    score = 0
    # Rainfall contribution (most important)
    if r > 200: score += 3
    elif r > 120: score += 2
    elif r > 60:  score += 1
    # River level
    if rl > 7:  score += 2
    elif rl > 4: score += 1
    # Low elevation = flood-prone
    if el < 50:  score += 2
    elif el < 150: score += 1
    # High humidity = saturated soil
    if h > 85: score += 1
    return 1 if score >= 4 else 0

flood = np.array([label(r,h,rl,el,t)
                  for r,h,rl,el,t in zip(rainfall,humidity,river_level,elevation,temperature)])

# Add 4% noise
noise = np.random.rand(N) < 0.04
flood[noise] = 1 - flood[noise]

df = pd.DataFrame({
    "rainfall":      rainfall,
    "humidity":      humidity,
    "riverLevel":    river_level,
    "elevation":     elevation,
    "temperature":   temperature,
    "flood_occurred": flood,
})

df.to_csv("dataset.csv", index=False)
print(f"Generated {len(df)} rows -> dataset.csv")
print(df["flood_occurred"].value_counts())
print(f"Flood rate: {df['flood_occurred'].mean():.1%}")
