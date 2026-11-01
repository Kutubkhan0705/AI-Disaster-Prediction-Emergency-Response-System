import express from "express";
import {
  createAlert,
  getAlerts,
  getAlertById,
  deactivateAlert,
} from "../controllers/alertController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAlerts);
router.get("/:id", getAlertById);
router.post("/", protect, authorize("admin", "responder"), createAlert);
router.put("/:id/deactivate", protect, authorize("admin", "responder"), deactivateAlert);

export default router;
