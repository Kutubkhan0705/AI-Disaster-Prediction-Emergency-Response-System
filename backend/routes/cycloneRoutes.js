import express from "express";
import { predictCycloneRisk, getCycloneHistory } from "../controllers/cycloneController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/predict", protect, predictCycloneRisk);
router.get("/history", protect, getCycloneHistory);

export default router;
