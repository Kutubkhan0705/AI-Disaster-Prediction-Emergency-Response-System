import express from "express";
import { predictFloodRisk, getFloodHistory } from "../controllers/floodController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/predict", protect, predictFloodRisk);
router.get("/history", protect, getFloodHistory);

export default router;
