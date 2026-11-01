import { useCallback, useState } from "react";
import { getLiveWeather } from "../services/disasterService.js";
import { toast } from "react-toastify";

export function useAutoFill() {
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [liveData, setLiveData] = useState(null);

  const fetchWeather = useCallback(async (lat, lon, setForm) => {
    if (!lat || !lon) return;
    setWeatherLoading(true);
    setLiveData(null);
    try {
      const w = await getLiveWeather(lat, lon);
      setLiveData(w);
      setForm((f) => ({
        ...f,
        ...(w.humidity        != null && { humidity:        String(w.humidity) }),
        ...(w.pressure        != null && { pressure:        String(w.pressure) }),
        ...(w.windSpeed       != null && { windSpeed:       String(w.windSpeed) }),
        ...(w.rainfall        != null && { rainfall:        String(w.rainfall) }),
        ...(w.riverLevel      != null && { riverLevel:      String(w.riverLevel) }),
        ...(w.seaSurfaceTemp  != null && { seaSurfaceTemp:  String(w.seaSurfaceTemp) }),
        ...(w.elevation       != null && { elevation:       String(w.elevation) }),
        ...(w.distanceToCoast != null && { distanceToCoast: String(w.distanceToCoast) }),
      }));
      const filled = Object.keys(w).filter((k) => w[k] != null).length;
      toast.success(`✅ ${filled} live data fields auto-filled!`);
    } catch {
      toast.warn("Could not fetch live weather. Fill manually.");
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  return { fetchWeather, weatherLoading, liveData };
}
