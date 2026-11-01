import axios from "axios";

const EARTHQUAKE_API_URL =
  process.env.EARTHQUAKE_API_URL || "https://earthquake.usgs.gov/fdsnws/event/1/query";

// Fetch recent seismic activity from USGS to feed the earthquake ML model / live feed
export const getRecentEarthquakes = async ({ minMagnitude = 2.5, days = 7 } = {}) => {
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - days * 24 * 60 * 60 * 1000);

  const { data } = await axios.get(EARTHQUAKE_API_URL, {
    params: {
      format: "geojson",
      starttime: startTime.toISOString(),
      endtime: endTime.toISOString(),
      minmagnitude: minMagnitude,
    },
  });

  return data.features.map((f) => ({
    id: f.id,
    magnitude: f.properties.mag,
    place: f.properties.place,
    time: new Date(f.properties.time),
    depth: f.geometry.coordinates[2],
    coordinates: f.geometry.coordinates, // [lng, lat, depth]
    url: f.properties.url,
  }));
};
