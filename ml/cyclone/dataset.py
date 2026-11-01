"""
Generate a realistic synthetic cyclone dataset.
Primary drivers: seaSurfaceTemp + pressure (real meteorology).
windSpeed is DERIVED from category, not the other way around.
Classes are balanced ~equal across 0-5.

Run: python dataset.py
"""
import numpy as np
import pandas as pd

np.random.seed(42)
N_PER_CLASS = 300   # 300 per category = 1800 total, balanced

rows = []

# Category definitions: (sst_range, pressure_range, wind_range, humidity_range)
CAT_PARAMS = {
    0: dict(sst=(20, 26),  pressure=(990, 1015), wind=(5,  62),  hum=(40, 75)),   # No cyclone
    1: dict(sst=(26, 28),  pressure=(975, 995),  wind=(63, 88),  hum=(70, 85)),   # Tropical Storm
    2: dict(sst=(27, 29),  pressure=(960, 980),  wind=(89, 118), hum=(75, 90)),   # Cat 1
    3: dict(sst=(28, 30),  pressure=(945, 965),  wind=(119,153), hum=(80, 92)),   # Cat 2
    4: dict(sst=(29, 31),  pressure=(920, 950),  wind=(154,177), hum=(82, 95)),   # Cat 3
    5: dict(sst=(29, 32),  pressure=(880, 925),  wind=(178,250), hum=(85, 99)),   # Cat 4/5
}

for cat, p in CAT_PARAMS.items():
    for _ in range(N_PER_CLASS):
        sst  = np.random.uniform(*p["sst"])
        pres = np.random.uniform(*p["pressure"])
        wind = np.random.uniform(*p["wind"])
        hum  = np.random.uniform(*p["hum"])
        # Cyclones form over tropical oceans, closer to coast = more dangerous
        dist = np.random.uniform(0, 1500) if cat == 0 else np.random.uniform(0, 800)
        lat  = np.random.uniform(-25, 25)   # tropical belt
        lon  = np.random.uniform(-180, 180)
        rows.append([wind, pres, sst, hum, dist, lat, lon, cat])

df = pd.DataFrame(rows, columns=[
    "windSpeed", "pressure", "seaSurfaceTemp", "humidity",
    "distanceToCoast", "lat", "lon", "cyclone_category"
])

# Add 3% noise
noise_idx = df.sample(frac=0.03, random_state=1).index
df.loc[noise_idx, "cyclone_category"] = np.random.randint(0, 6, len(noise_idx))

df = df.sample(frac=1, random_state=42).reset_index(drop=True)
df.to_csv("dataset.csv", index=False)
print(f"Generated {len(df)} rows -> dataset.csv")
print(df["cyclone_category"].value_counts().sort_index())
