

import axios from "axios";

// Python FastAPI ML service URL
const ML_API_URL =
  process.env.ML_API_URL || "http://localhost:8000";

// Flood Prediction
export const predictFlood = async (features) => {
  const { data } = await axios.post(
    `${ML_API_URL}/predict/flood`,
    features
  );
  return data;
};

// Earthquake Prediction
export const predictEarthquake = async (features) => {
  const { data } = await axios.post(
    `${ML_API_URL}/predict/earthquake`,
    features
  );
  return data;
};

// Cyclone Prediction
export const predictCyclone = async (features) => {
  const { data } = await axios.post(
    `${ML_API_URL}/predict/cyclone`,
    features
  );
  return data;
};
