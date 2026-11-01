import api from "./api.js";

export const getLiveWeather = async (lat, lon) => {
  const { data } = await api.get("/weather/live", { params: { lat, lon } });
  return data.data;
};

export const predictFlood = async (payload) => {
  const { data } = await api.post("/flood/predict", payload);
  return data.data;
};

export const predictEarthquake = async (payload) => {
  const { data } = await api.post("/earthquake/predict", payload);
  return data.data;
};

export const predictCyclone = async (payload) => {
  const { data } = await api.post("/cyclone/predict", payload);
  return data.data;
};

export const getRecentEarthquakes = async (params) => {
  const { data } = await api.get("/earthquake/recent", { params });
  return data.data;
};

export const getAlerts = async () => {
  const { data } = await api.get("/alerts");
  return data.data;
};

export const getDisasters = async (params) => {
  const { data } = await api.get("/disasters", { params });
  return data.data;
};
