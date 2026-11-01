import express from "express";
import asyncHandler from "express-async-handler";
import Disaster from "../models/Disaster.js";

const router = express.Router();

// @route GET /api/disasters
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { type, severity, limit = 200 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    const disasters = await Disaster.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    res.json({ success: true, data: disasters });
  })
);

export default router;
