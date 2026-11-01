import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["flood", "earthquake", "cyclone", "general"], default: "general" },
    severity: { type: String, enum: ["info", "warning", "danger", "critical"], default: "warning" },
    region: { type: String },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    disaster: { type: mongoose.Schema.Types.ObjectId, ref: "Disaster" },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

alertSchema.index({ location: "2dsphere" });

export default mongoose.model("Alert", alertSchema);
