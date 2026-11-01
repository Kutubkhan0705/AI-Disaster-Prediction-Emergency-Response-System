import express from "express";
import asyncHandler from "express-async-handler";
import axios from "axios";
import { getWeatherByCoords } from "../services/weatherService.js";

const router = express.Router();

// ── Haversine distance (km) ──────────────────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Coastline reference points ───────────────────────────────────────────────
const COAST_POINTS = [
  // India — west coast
  [8.08,77.55],[8.5,76.9],[9.9,76.3],[10.8,76.0],[11.9,75.3],[12.9,74.8],
  [15.0,74.0],[17.3,73.3],[19.0,72.8],[21.0,70.5],[22.5,69.7],[23.0,68.9],
  [22.5,72.0],[21.7,72.6],[20.7,72.9],
  // India — east coast
  [10.8,79.8],[11.9,79.8],[13.1,80.3],[15.5,80.0],[16.9,82.2],
  [18.8,84.7],[20.3,86.7],[21.5,87.1],[22.5,88.3],
  // Bay of Bengal / Sri Lanka
  [7.0,79.8],[6.0,80.2],[8.5,81.2],[9.7,80.0],
  // Arabian Sea
  [24.8,67.0],[25.3,63.5],[22.3,59.5],[23.6,58.5],
  // Southeast Asia
  [1.3,103.8],[3.1,101.7],[5.4,100.3],[13.7,100.5],[10.8,106.7],
  [16.0,108.2],[20.8,106.9],[22.3,114.2],[22.5,120.2],[25.0,121.5],
  // East Asia
  [31.2,121.5],[35.6,139.7],[34.7,135.5],[37.5,126.9],[37.9,140.9],
  // Europe Atlantic
  [51.5,-0.1],[48.8,2.3],[43.3,-1.9],[36.7,-4.4],[38.7,-9.1],
  [53.3,-6.2],[55.9,-3.2],[57.1,-2.1],[60.4,5.3],[59.9,10.7],
  // Americas
  [40.7,-74.0],[25.8,-80.2],[29.9,-90.1],[19.4,-99.1],[4.7,-74.1],
  [-23.5,-46.6],[-34.6,-58.4],[-33.4,-70.6],
  // Africa
  [30.0,31.2],[36.8,10.2],[33.9,18.4],[-26.2,28.0],[-33.9,18.4],
  [6.4,3.4],[5.6,-0.2],[14.7,-17.4],
  // Australia
  [-33.9,151.2],[-37.8,144.9],[-27.5,153.0],[-31.9,115.9],[-12.5,130.8],
];

function distanceToCoast(lat, lon) {
  let min = Infinity;
  for (const [clat, clon] of COAST_POINTS) {
    const d = haversine(lat, lon, clat, clon);
    if (d < min) min = d;
  }
  return Math.round(min);
}

// ── Latitude-based SST estimate (always works, no API needed) ────────────────
// Based on climatological mean SST by latitude band
function estimateSSTByLatitude(lat) {
  const absLat = Math.abs(lat);
  if (absLat < 10)  return 29.0;   // equatorial — very warm
  if (absLat < 20)  return 28.0;   // tropical
  if (absLat < 30)  return 26.0;   // subtropical
  if (absLat < 40)  return 22.0;   // temperate
  if (absLat < 50)  return 16.0;   // cool temperate
  if (absLat < 60)  return 10.0;   // subpolar
  return 4.0;                       // polar
}

// ── Route ────────────────────────────────────────────────────────────────────
router.get(
  "/live",
  asyncHandler(async (req, res) => {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    if (!req.query.lat || !req.query.lon)
      return res.status(400).json({ message: "lat and lon required" });

    const result = {};

    // 1. Distance to coast — pure calculation, always available
    result.distanceToCoast = distanceToCoast(lat, lon);

    // 2. Open-Meteo weather (free, no key) — current conditions + 7-day cumulative rainfall
    try {
      const { data: om } = await axios.get("https://api.open-meteo.com/v1/forecast", {
        params: {
          latitude: lat, longitude: lon,
          current: "temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,precipitation",
          daily: "precipitation_sum",
          wind_speed_unit: "kmh",
          forecast_days: 7,
          past_days: 7,
        },
        timeout: 6000,
      });
      const c = om.current;
      if (c) {
        if (c.temperature_2m       != null) result.temperature = parseFloat(c.temperature_2m.toFixed(1));
        if (c.relative_humidity_2m != null) result.humidity    = Math.round(c.relative_humidity_2m);
        if (c.surface_pressure     != null) result.pressure    = Math.round(c.surface_pressure);
        if (c.wind_speed_10m       != null) result.windSpeed   = Math.round(c.wind_speed_10m);
      }
      // Use 7-day cumulative rainfall — much more meaningful for flood risk
      const dailyRain = om.daily?.precipitation_sum;
      if (dailyRain) {
        const past7 = dailyRain.slice(0, 7).filter(v => v != null);
        result.rainfall = parseFloat(past7.reduce((a, b) => a + b, 0).toFixed(1));
      }
    } catch {
      // Fallback: OpenWeatherMap (needs API key)
      try {
        const w = await getWeatherByCoords(lat, lon);
        if (w.temperature != null) result.temperature = w.temperature;
        if (w.humidity    != null) result.humidity    = w.humidity;
        if (w.pressure    != null) result.pressure    = w.pressure;
        if (w.windSpeed   != null) result.windSpeed   = Math.round(w.windSpeed * 3.6);
        if (w.rainfall    != null) result.rainfall    = w.rainfall;
      } catch { /* both unavailable */ }
    }

    // 3. Elevation (free, no key)
    try {
      const { data: elev } = await axios.get("https://api.open-meteo.com/v1/elevation", {
        params: { latitude: lat, longitude: lon },
        timeout: 4000,
      });
      if (elev.elevation?.[0] != null) result.elevation = Math.round(elev.elevation[0]);
    } catch { /* skip */ }

    // 4. Sea Surface Temperature — 3-tier fallback, ALWAYS returns a value
    let sstSource = null;

    // Tier 1: Open-Meteo Marine API (works for ocean grid cells)
    if (!sstSource) {
      try {
        const { data: marine } = await axios.get("https://marine-api.open-meteo.com/v1/marine", {
          params: {
            latitude: lat, longitude: lon,
            current: "sea_surface_temperature,wave_height",
          },
          timeout: 5000,
        });
        const cur = marine.current;
        if (cur?.sea_surface_temperature != null) {
          result.seaSurfaceTemp = parseFloat(cur.sea_surface_temperature.toFixed(1));
          if (cur.wave_height != null) result.waveHeight = parseFloat(cur.wave_height.toFixed(2));
          sstSource = "marine-api";
        }
      } catch { /* inland — try next */ }
    }

    // Tier 2: NOAA CoastWatch ERDDAP — searches nearby ocean cells if land cell returns null
    if (!sstSource) {
      try {
        // Try progressively offset coordinates toward nearest ocean
        const offsets = [[0,0],[0,2],[-2,0],[0,-2],[2,0],[-2,2],[2,-2],[2,2],[-2,-2],[0,4],[-4,0],[0,-4],[4,0]];
        for (const [dLat, dLon] of offsets) {
          const latR = parseFloat((lat + dLat).toFixed(1));
          const lonR = parseFloat((lon + dLon).toFixed(1));
          const url =
            `https://coastwatch.pfeg.noaa.gov/erddap/griddap/jplMURSST41.json` +
            `?analysed_sst[(last):1:(last)][(${latR}):1:(${latR})][(${lonR}):1:(${lonR})]`;
          const { data: erddap } = await axios.get(url, { timeout: 6000 });
          const sst = erddap?.table?.rows?.[0]?.[3];
          if (sst != null && !isNaN(sst)) {
            result.seaSurfaceTemp = parseFloat(Number(sst).toFixed(1));
            sstSource = "noaa-erddap";
            break;
          }
        }
      } catch { /* try next */ }
    }

    // Tier 3: Latitude-based climatological estimate — always works
    if (!sstSource) {
      result.seaSurfaceTemp = estimateSSTByLatitude(lat);
      result.sstEstimated = true; // flag so frontend can show "(estimated)"
    }

    // 5. River discharge → river level estimate
    try {
      const { data: flood } = await axios.get("https://flood-api.open-meteo.com/v1/flood", {
        params: {
          latitude: lat, longitude: lon,
          daily: "river_discharge",
          forecast_days: 1,
        },
        timeout: 5000,
      });
      const discharge = flood.daily?.river_discharge?.[0];
      if (discharge != null && discharge > 0) {
        result.riverDischarge = parseFloat(discharge.toFixed(2));
        result.riverLevel = parseFloat(Math.min(Math.log1p(discharge) / 2, 10).toFixed(2));
      }
    } catch { /* skip */ }

    res.json({ success: true, data: result });
  })
);

export default router;
