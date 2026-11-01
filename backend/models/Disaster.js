import mongoose from "mongoose";

const disasterSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["flood", "earthquake", "cyclone", "other"], required: true },
    title: { type: String, required: true },
    description: { type: String },
    severity: { type: String, enum: ["low", "moderate", "high", "critical"], default: "moderate" },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    region: { type: String },
    source: { type: String, default: "system" }, // e.g. USGS, OpenWeather, ML
    status: { type: String, enum: ["active", "monitoring", "resolved"], default: "active" },
    rawData: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

disasterSchema.index({ location: "2dsphere" });

export default mongoose.model("Disaster", disasterSchema);
