import axios from "axios";

const WEATHER_API_URL = process.env.WEATHER_API_URL || "https://api.openweathermap.org/data/2.5";
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// Fetch current weather + rainfall data for a location, used as ML feature input for flood risk
export const getWeatherByCoords = async (lat, lon) => {
  const { data } = await axios.get(`${WEATHER_API_URL}/weather`, {
    params: { lat, lon, appid: WEATHER_API_KEY, units: "metric" },
  });

  return {
    temperature: data.main?.temp,
    humidity: data.main?.humidity,
    pressure: data.main?.pressure,
    windSpeed: data.wind?.speed,
    rainfall: data.rain?.["1h"] ?? 0,
    description: data.weather?.[0]?.description,
  };
};

export const getForecastByCoords = async (lat, lon) => {
  const { data } = await axios.get(`${WEATHER_API_URL}/forecast`, {
    params: { lat, lon, appid: WEATHER_API_KEY, units: "metric" },
  });
  return data.list;
};
