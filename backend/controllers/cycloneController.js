import asyncHandler from "express-async-handler";
import Prediction from "../models/Prediction.js";
import Disaster from "../models/Disaster.js";
import { predictCyclone } from "../services/mlService.js";

// @desc   Predict cyclone category/risk for a location using ML model
// @route  POST /api/cyclone/predict
export const predictCycloneRisk = asyncHandler(async (req, res) => {
  const { lat, lon, windSpeed, pressure, seaSurfaceTemp, humidity, distanceToCoast } = req.body;

  const features = {
    windSpeed: windSpeed ?? 0,
    pressure: pressure ?? 1010,
    seaSurfaceTemp: seaSurfaceTemp ?? 28,
    humidity: humidity ?? 75,
    distanceToCoast: distanceToCoast ?? 500,
    lat: lat ?? 0,
    lon: lon ?? 0,
  };

  const result = await predictCyclone(features);

  const prediction = await Prediction.create({
    type: "cyclone",
    inputFeatures: features,
    predictionResult: {
      label: result.label,
      category: result.category,
      riskScore: result.riskScore,
      probability: result.probability,
    },
    location: lat && lon ? { type: "Point", coordinates: [lon, lat] } : undefined,
    requestedBy: req.user?._id,
  });

  if (result.riskScore >= 0.4) {
    const disaster = await Disaster.create({
      type: "cyclone",
      title: `Cyclone Risk: ${result.label}`,
      description: `Predicted cyclone category ${result.category} at given location`,
      severity: result.riskScore >= 0.8 ? "critical" : result.riskScore >= 0.6 ? "high" : "moderate",
      location: { type: "Point", coordinates: [lon ?? 0, lat ?? 0] },
      source: "ml-model",
    });
    req.app.get("io")?.emit("disaster:new", disaster);
  }

  res.status(200).json({ success: true, data: prediction });
});

// @desc   Get cyclone prediction history
// @route  GET /api/cyclone/history
export const getCycloneHistory = asyncHandler(async (req, res) => {
  const predictions = await Prediction.find({ type: "cyclone" }).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, data: predictions });
});
