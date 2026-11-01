"""
Unified ML API microservice.
Exposes flood and earthquake prediction models over HTTP so the Node/Express
backend (backend/services/mlService.js) can call them.

Run:
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000
    python -m uvicorn main:app --reload --port 8000

"""
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "flood"))
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "earthquake"))
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "cyclone"))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import importlib.util


def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


BASE_DIR = os.path.dirname(__file__)
flood_module = load_module("flood_predict", os.path.join(BASE_DIR, "..", "flood", "predict.py"))
earthquake_module = load_module("earthquake_predict", os.path.join(BASE_DIR, "..", "earthquake", "predict.py"))
cyclone_module = load_module("cyclone_predict", os.path.join(BASE_DIR, "..", "cyclone", "predict.py"))

app = FastAPI(title="AI Disaster System - ML API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class FloodFeatures(BaseModel):
    rainfall: float = 0
    humidity: float = 0
    riverLevel: float = 0
    elevation: float = 0
    temperature: float = 0


class EarthquakeFeatures(BaseModel):
    depth: float = 0
    historicalMagnitude: float = 0
    faultDistance: float = 0
    lat: float = 0
    lon: float = 0


class CycloneFeatures(BaseModel):
    windSpeed: float = 0
    pressure: float = 1010
    seaSurfaceTemp: float = 28
    humidity: float = 75
    distanceToCoast: float = 500
    lat: float = 0
    lon: float = 0


@app.get("/")
def root():
    return {"message": "ML API for AI Disaster System is running "}


@app.post("/predict/flood")
def predict_flood(features: FloodFeatures):
    try:
        # working directory needs to be ml/flood so the model file resolves;
        # instead we cd via absolute path override
        os.chdir(os.path.join(BASE_DIR, "..", "flood"))
        result = flood_module.predict(features.dict())
        return result
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Flood model not found. Run ml/flood/train.py first.")


@app.post("/predict/earthquake")
def predict_earthquake(features: EarthquakeFeatures):
    try:
        os.chdir(os.path.join(BASE_DIR, "..", "earthquake"))
        result = earthquake_module.predict(features.dict())
        return result
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Earthquake model not found. Run ml/earthquake/train.py first.")


@app.post("/predict/cyclone")
def predict_cyclone(features: CycloneFeatures):
    try:
        os.chdir(os.path.join(BASE_DIR, "..", "cyclone"))
        result = cyclone_module.predict(features.dict())
        return result
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Cyclone model not found. Run ml/cyclone/train.py first.")
