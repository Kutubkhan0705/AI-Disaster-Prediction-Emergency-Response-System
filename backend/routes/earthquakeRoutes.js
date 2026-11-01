import express from "express";
import {
  predictEarthquakeRisk,
  getRecentSeismicActivity,
  getEarthquakeHistory,
} from "../controllers/earthquakeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/predict", protect, predictEarthquakeRisk);
router.get("/recent", getRecentSeismicActivity);
router.get("/history", protect, getEarthquakeHistory);

export default router;
