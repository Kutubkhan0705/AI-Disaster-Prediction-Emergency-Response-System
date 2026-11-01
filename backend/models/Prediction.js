import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["flood", "earthquake", "cyclone"], required: true },
    inputFeatures: { type: mongoose.Schema.Types.Mixed, required: true },
    predictionResult: {
      label: { type: String },
      probability: { type: Number },
      magnitude: { type: Number },
      riskScore: { type: Number },
      category: { type: Number }, // for cyclone (0-5)
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    modelVersion: { type: String, default: "v1" },
  },
  { timestamps: true }
);

export default mongoose.model("Prediction", predictionSchema);
