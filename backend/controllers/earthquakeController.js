import asyncHandler from "express-async-handler";
import Prediction from "../models/Prediction.js";
import Disaster from "../models/Disaster.js";
import { getRecentEarthquakes } from "../services/earthquakeService.js";
import { predictEarthquake } from "../services/mlService.js";

// @desc   Predict earthquake risk/magnitude for a region using ML model
// @route  POST /api/earthquake/predict
export const predictEarthquakeRisk = asyncHandler(async (req, res) => {
  const { lat, lon, depth, historicalMagnitude, faultDistance } = req.body;

  const features = {
    depth: depth ?? 10,
    historicalMagnitude: historicalMagnitude ?? 0,
    faultDistance: faultDistance ?? 0,
    lat: lat ?? 0,
    lon: lon ?? 0,
  };

  const result = await predictEarthquake(features);

  const prediction = await Prediction.create({
    type: "earthquake",
    inputFeatures: features,
    predictionResult: {
      label: result.label,
      magnitude: result.magnitude,
      riskScore: result.riskScore,
    },
    location: lat && lon ? { type: "Point", coordinates: [lon, lat] } : undefined,
    requestedBy: req.user?._id,
  });

  if (result.riskScore >= 0.7) {
    const disaster = await Disaster.create({
      type: "earthquake",
      title: "High Earthquake Risk Detected",
      description: `Predicted magnitude ~${result.magnitude} at given location`,
      severity: result.riskScore >= 0.9 ? "critical" : "high",
      location: { type: "Point", coordinates: [lon ?? 0, lat ?? 0] },
      source: "ml-model",
    });
    req.app.get("io")?.emit("disaster:new", disaster);
  }

  res.status(200).json({ success: true, data: prediction });
});

// @desc   Get recent real seismic activity from USGS
// @route  GET /api/earthquake/recent
export const getRecentSeismicActivity = asyncHandler(async (req, res) => {
  const { minMagnitude, days } = req.query;
  const data = await getRecentEarthquakes({
    minMagnitude: minMagnitude ? Number(minMagnitude) : undefined,
    days: days ? Number(days) : undefined,
  });
  res.json({ success: true, data });
});

// @desc   Get earthquake prediction history
// @route  GET /api/earthquake/history
export const getEarthquakeHistory = asyncHandler(async (req, res) => {
  const predictions = await Prediction.find({ type: "earthquake" }).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, data: predictions });
});
