import asyncHandler from "express-async-handler";
import Alert from "../models/Alert.js";

// @desc   Create and broadcast a new alert in real time via Socket.io
// @route  POST /api/alerts
export const createAlert = asyncHandler(async (req, res) => {
  const { title, message, type, severity, region, coordinates, disaster } = req.body;

  const alert = await Alert.create({
    title,
    message,
    type,
    severity,
    region,
    location: coordinates ? { type: "Point", coordinates } : undefined,
    disaster,
    issuedBy: req.user?._id,
  });

  // Broadcast instantly to all connected clients
  req.app.get("io")?.emit("alert:new", alert);

  res.status(201).json({ success: true, data: alert });
});

// @desc   Get all active alerts
// @route  GET /api/alerts
export const getAlerts = asyncHandler(async (req, res) => {
  const alerts = await Alert.find({ active: true }).sort({ createdAt: -1 });
  res.json({ success: true, data: alerts });
});

// @desc   Get single alert
// @route  GET /api/alerts/:id
export const getAlertById = asyncHandler(async (req, res) => {
  const alert = await Alert.findById(req.params.id);
  if (!alert) {
    res.status(404);
    throw new Error("Alert not found");
  }
  res.json({ success: true, data: alert });
});

// @desc   Deactivate/resolve an alert
// @route  PUT /api/alerts/:id/deactivate
export const deactivateAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!alert) {
    res.status(404);
    throw new Error("Alert not found");
  }
  req.app.get("io")?.emit("alert:resolved", alert);
  res.json({ success: true, data: alert });
});
