# AI Disaster Prediction & Alert System

A full-stack, real-time disaster prediction and alerting platform combining
Machine Learning (flood & earthquake risk models), an Express/Socket.io API,
and a React + Bootstrap frontend with live maps.

## Architecture

```
AI-Disaster-System/
├── frontend/react-app   → React 18 + Vite + Bootstrap 5 + Socket.io client + Leaflet
├── backend/              → Node.js (ES Modules) + Express + Socket.io + MongoDB
├── ml/                   → Python ML models (scikit-learn) + FastAPI microservice
└── data/                 → raw/processed datasets
```

## How it fits together

1. **ml/** trains two models (`flood_model.pkl`, `earthquake_model.pkl`) and serves
   them over HTTP via **ml/api/main.py** (FastAPI, port 8000).
2. **backend/** is the main Express API (port 5000). Its `services/mlService.js`
   calls the FastAPI ML service for predictions, `services/weatherService.js` pulls
   live weather from OpenWeatherMap, and `services/earthquakeService.js` pulls
   recent quakes from USGS. When a prediction crosses a risk threshold, the backend
   auto-creates a `Disaster`/`Alert` record and **broadcasts it instantly over
   Socket.io** to every connected client.
3. **frontend/react-app** is the dashboard: login/register (JWT), flood & earthquake
   prediction forms, a live Leaflet map, and a real-time alert feed that updates
   the moment the backend emits a socket event — no refresh needed.

## Setup

### 1. ML service (Python)
```bash
cd ml/flood      && pip install -r requirements.txt && python train.py
cd ../earthquake  && pip install -r requirements.txt && python train.py
cd ../api         && pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Backend (Node.js, ES Modules)
```bash
cd backend
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, WEATHER_API_KEY, etc.
npm install
npm run dev             # nodemon, http://localhost:5000
```

### 3. Frontend (React + Vite + Bootstrap)
```bash
cd frontend/react-app
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

## Key features

- 🔐 JWT authentication (register/login, protected routes)
- 🌊 Flood risk prediction (rainfall, humidity, river level, elevation → ML model)
- 🌎 Earthquake risk/magnitude prediction (depth, fault distance, history → ML model)
- 📡 Live USGS seismic feed
- 🔔 Real-time alert broadcasting via Socket.io (no polling)
- 🗺️ Interactive Leaflet map of active disasters
- 🎨 Responsive Bootstrap 5 UI (react-bootstrap)

## Tech stack

| Layer     | Stack |
|-----------|-------|
| Frontend  | React 18, Vite, React Router, Bootstrap 5 / react-bootstrap, Socket.io-client, Leaflet |
| Backend   | Node.js (ESM), Express, Socket.io, MongoDB/Mongoose, JWT, bcrypt |
| ML        | Python, scikit-learn, pandas, FastAPI, uvicorn |
| Data      | CSV datasets under `data/` and `ml/*/dataset.csv` |
