import mongoose from "mongoose";

const shelterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String },
    capacity: { type: Number, default: 0 },
    occupancy: { type: Number, default: 0 },
    contactPhone: { type: String },
    facilities: [{ type: String }], // e.g. ["food", "medical", "water"]
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

shelterSchema.index({ location: "2dsphere" });

export default mongoose.model("Shelter", shelterSchema);
