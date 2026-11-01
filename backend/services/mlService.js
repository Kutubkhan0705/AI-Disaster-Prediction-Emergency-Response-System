import axios from "axios";

const ML_API_URL =
  import.meta.env.VITE_ML_API_URL || "http://localhost:8000";

// Calls the Python FastAPI ML microservice (ml/api/main.py)
export const predictFlood = async (features) => {
  const { data } = await axios.post(`${ML_API_URL}/predict/flood`, features);
  return data;
};

export const predictEarthquake = async (features) => {
  const { data } = await axios.post(`${ML_API_URL}/predict/earthquake`, features);
  return data;
};

export const predictCyclone = async (features) => {
  const { data } = await axios.post(`${ML_API_URL}/predict/cyclone`, features);
  return data;
};
