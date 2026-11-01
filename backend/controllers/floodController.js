import asyncHandler from "express-async-handler";
import axios from "axios";
import Prediction from "../models/Prediction.js";
import Disaster from "../models/Disaster.js";
import { predictFlood } from "../services/mlService.js";

const BACKEND_URL = `http://localhost:${process.env.PORT || 5000}`;

// @desc   Predict flood risk for a location using live weather data + ML model
// @route  POST /api/flood/predict
export const predictFloodRisk = asyncHandler(async (req, res) => {
  const { lat, lon, rainfall, riverLevel, elevation } = req.body;

  let liveData = {};

  // Fetch from our own /api/weather/live which has 7-day rainfall, river level, elevation
  if (lat && lon) {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/weather/live`, {
        params: { lat, lon },
        timeout: 10000,
      });
      liveData = data.data || {};
    } catch {
      // Weather fetch failed — use user-provided values
    }
  }

  const features = {
    rainfall: rainfall ?? liveData.rainfall ?? 0,
    humidity: liveData.humidity ?? 60,
    riverLevel: riverLevel ?? liveData.riverLevel ?? 0,
    elevation: elevation ?? liveData.elevation ?? 0,
    temperature: liveData.temperature ?? 25,
  };

  let result;

  try {
    console.log("Flood features:", features);
    console.log("ML API URL:", process.env.ML_API_URL);

    result = await predictFlood(features);

    console.log("ML prediction result:", result);
  } catch (error) {
    console.error("Flood ML Error:", error.message);
    console.error("ML Response:", error.response?.data);
    console.error("ML Status:", error.response?.status);

    return res.status(502).json({
      success: false,
      message: "Flood prediction service failed",
      error: error.response?.data || error.message,
    });
  }

  const prediction = await Prediction.create({
    type: "flood",
    inputFeatures: features,
    predictionResult: {
      label: result.label,
      probability: result.probability,
      riskScore: result.riskScore,
    },
    location: lat && lon ? { type: "Point", coordinates: [lon, lat] } : undefined,
    requestedBy: req.user?._id,
  });

  if (result.riskScore >= 0.7) {
    const disaster = await Disaster.create({
      type: "flood",
      title: "High Flood Risk Detected",
      description: `Predicted flood risk score ${result.riskScore} at given location`,
      severity: result.riskScore >= 0.9 ? "critical" : "high",
      location: { type: "Point", coordinates: [lon ?? 0, lat ?? 0] },
      source: "ml-model",
    });
    req.app.get("io")?.emit("disaster:new", disaster);
  }

  res.status(200).json({ success: true, data: prediction });
});

// @desc   Get flood prediction history
// @route  GET /api/flood/history
export const getFloodHistory = asyncHandler(async (req, res) => {
  const predictions = await Prediction.find({ type: "flood" }).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, data: predictions });
});
