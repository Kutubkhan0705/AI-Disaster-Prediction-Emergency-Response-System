import React, { useState } from "react";
import { Container, Form, Row, Col, Alert } from "react-bootstrap";
import { toast } from "react-toastify";
import { predictCyclone } from "../services/disasterService.js";
import PredictionResultCard from "../components/PredictionResultCard.jsx";
import LocationSearch from "../components/LocationSearch.jsx";
import { useAutoFill } from "../hooks/useAutoFill.js";
import LiveDataPanel from "../components/LiveDataPanel.jsx";

const initialForm = {
  lat: "", lon: "",
  windSpeed: "", pressure: "", seaSurfaceTemp: "",
  humidity: "", distanceToCoast: "",
};

const CATEGORY_INFO = [
  { cat: "No Cyclone",      color: "#198754", desc: "Conditions do not support cyclone formation" },
  { cat: "Tropical Storm",  color: "#0dcaf0", desc: "Wind 63–88 km/h, minimal damage" },
  { cat: "Category 1",      color: "#ffc107", desc: "Wind 119–153 km/h, some damage" },
  { cat: "Category 2",      color: "#fd7e14", desc: "Wind 154–177 km/h, extensive damage" },
  { cat: "Category 3",      color: "#dc3545", desc: "Wind 178–208 km/h, devastating" },
  { cat: "Category 4/5",    color: "#6f42c1", desc: "Wind >209 km/h, catastrophic" },
];

export default function CyclonePrediction() {
  const [form, setForm]           = useState(initialForm);
  const [locationName, setLocationName] = useState("");
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const { fetchWeather, weatherLoading, liveData } = useAutoFill();

  const applyLocation = (lat, lon, name = "") => {
    setForm((f) => ({ ...f, lat, lon }));
    if (name) setLocationName(name);
    fetchWeather(lat, lon, setForm);
  };

  const getLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported.");
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const lat = coords.latitude.toFixed(5);
        const lon = coords.longitude.toFixed(5);
        // Reverse geocode for display name
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const d = await res.json();
          const name = d.address?.city || d.address?.town || d.address?.state || d.display_name?.split(",")[0] || "";
          applyLocation(lat, lon, name);
        } catch {
          applyLocation(lat, lon);
        }
        toast.success("Location detected!");
        setLocLoading(false);
      },
      () => { toast.error("Location access denied."); setLocLoading(false); }
    );
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const payload = {
        lat:             form.lat             ? Number(form.lat)             : undefined,
        lon:             form.lon             ? Number(form.lon)             : undefined,
        windSpeed:       form.windSpeed       ? Number(form.windSpeed)       : undefined,
        pressure:        form.pressure        ? Number(form.pressure)        : undefined,
        seaSurfaceTemp:  form.seaSurfaceTemp  ? Number(form.seaSurfaceTemp)  : undefined,
        humidity:        form.humidity        ? Number(form.humidity)        : undefined,
        distanceToCoast: form.distanceToCoast ? Number(form.distanceToCoast) : undefined,
      };
      const data = await predictCyclone(payload);
      setResult(data);
      toast.info(`Prediction: ${data.predictionResult.label}`);
    } catch (err) {
      setError(err.response?.data?.message || "Prediction failed. Are you logged in?");
    } finally { setLoading(false); }
  };

  const isBusy = locLoading || weatherLoading;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", padding: "32px 0" }}>
      <Container>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #0d9488, #134e4a)", borderRadius: 18, padding: "28px 32px", marginBottom: 28, color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🌀</div>
            <div>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Cyclone Risk Prediction</h3>
              <p style={{ margin: 0, opacity: 0.8, fontSize: 14 }}>
                ML-based cyclone category prediction — select a location to auto-fill live weather data
              </p>
            </div>
          </div>
        </div>

        <Row className="g-4">
          {/* Form */}
          <Col lg={7}>
            <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 28, border: "1px solid var(--border-color)", boxShadow: "var(--card-shadow)" }}>
              <h5 style={{ color: "var(--text-primary)", marginBottom: 20, fontWeight: 600 }}>📍 Location & Atmospheric Parameters</h5>
              {error && <Alert variant="danger" style={{ borderRadius: 10 }}>{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  {/* Location search */}
                  <Col md={12}>
                    <LocationSearch
                      onSelect={({ lat, lon, display_name }) =>
                        applyLocation(lat, lon, display_name?.split(",")[0] || "")
                      }
                    />
                  </Col>

                  {/* GPS button */}
                  <Col md={12} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <button type="button" onClick={getLocation} disabled={isBusy}
                      style={{ background: "rgba(13,148,136,0.1)", border: "1px solid rgba(13,148,136,0.3)", borderRadius: 8, padding: "7px 16px", cursor: isBusy ? "not-allowed" : "pointer", color: "#0d9488", fontSize: 13, fontWeight: 600 }}>
                      📍 {locLoading ? "Detecting..." : weatherLoading ? "⏳ Fetching weather..." : "Use My Location"}
                    </button>

                    {/* Location name badge */}
                    {locationName && (
                      <span style={{ background: "rgba(13,148,136,0.12)", color: "#0d9488", borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 600 }}>
                        📌 {locationName}
                      </span>
                    )}

                    {/* Auto-fill status */}
                    {weatherLoading && (
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        🌐 Fetching live weather & sea data...
                      </span>
                    )}
                  </Col>

                  {/* Lat / Lon */}
                  {[
                    { label: "Latitude",  name: "lat", placeholder: "e.g. 15.0" },
                    { label: "Longitude", name: "lon", placeholder: "e.g. 80.0" },
                  ].map(({ label, name, placeholder }) => (
                    <Col md={6} key={name}>
                      <Form.Label style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 600 }}>{label}</Form.Label>
                      <Form.Control type="number" step="any" name={name} value={form[name]} onChange={handleChange} placeholder={placeholder} style={{ borderRadius: 10 }} />
                    </Col>
                  ))}

                  {/* Auto-filled fields — show teal border when filled */}
                  {[
                    { label: "💨 Wind Speed (km/h)",      name: "windSpeed",       placeholder: "Auto-filled from weather" },
                    { label: "🌡️ Pressure (hPa)",         name: "pressure",        placeholder: "Auto-filled from weather" },
                    { label: "🌊 Sea Surface Temp (°C)",  name: "seaSurfaceTemp",  placeholder: "Auto-filled from marine API" },
                    { label: "💧 Humidity (%)",           name: "humidity",        placeholder: "Auto-filled from weather" },
                    { label: "📏 Distance to Coast (km)", name: "distanceToCoast", placeholder: "Enter manually" },
                  ].map(({ label, name, placeholder }) => (
                    <Col md={4} key={name}>
                      <Form.Label style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 600 }}>
                        {label}
                        {form[name] && name !== "distanceToCoast" && (
                          <span style={{ marginLeft: 6, fontSize: 10, color: "#0d9488", fontWeight: 700 }}>● LIVE</span>
                        )}
                      </Form.Label>
                      <Form.Control
                        type="number" step="any" name={name} value={form[name]}
                        onChange={handleChange} placeholder={placeholder}
                        style={{
                          borderRadius: 10,
                          borderColor: form[name] && name !== "distanceToCoast" ? "#0d9488" : undefined,
                          boxShadow: form[name] && name !== "distanceToCoast" ? "0 0 0 2px rgba(13,148,136,0.15)" : undefined,
                        }}
                      />
                    </Col>
                  ))}
                </Row>
                <LiveDataPanel liveData={liveData} accentColor="#0d9488" />
                <button type="submit" disabled={loading || isBusy}
                  style={{ marginTop: 24, width: "100%", padding: "12px", borderRadius: 10, border: "none", background: (loading || isBusy) ? "#6c757d" : "linear-gradient(135deg,#0d9488,#134e4a)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: (loading || isBusy) ? "not-allowed" : "pointer", transition: "all 0.3s" }}>
                  {loading ? "⏳ Predicting..." : "🌀 Run Cyclone Prediction"}
                </button>
              </Form>
            </div>
          </Col>

          {/* Category Guide */}
          <Col lg={5}>
            <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 24, border: "1px solid var(--border-color)", boxShadow: "var(--card-shadow)", height: "100%" }}>
              <h5 style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: 16 }}>🌀 Cyclone Category Scale</h5>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {CATEGORY_INFO.map(({ cat, color, desc }) => (
                  <div key={cat} style={{ background: "var(--bg-main)", borderRadius: 10, padding: "10px 14px", borderLeft: `4px solid ${color}` }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color }}>{cat}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{desc}</div>
                  </div>
                ))}
              </div>

              {/* Live data source info */}
              <div style={{ marginTop: 16, padding: "12px 14px", background: "rgba(13,148,136,0.08)", borderRadius: 10, border: "1px solid rgba(13,148,136,0.2)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0d9488", marginBottom: 6 }}>🌐 Auto-fill Sources</div>
                {[
                  { icon: "💨", label: "Wind Speed, Pressure, Humidity", src: "OpenWeatherMap" },
                  { icon: "🌊", label: "Sea Surface Temperature",         src: "Open-Meteo Marine API" },
                  { icon: "🏞️", label: "River Level",                    src: "Open-Meteo Flood API" },
                ].map(({ icon, label, src }) => (
                  <div key={src} style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>
                    {icon} <strong>{label}</strong> — {src}
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>

        {result && (
          <div style={{ marginTop: 24 }}>
            <PredictionResultCard result={result} type="cyclone" />
          </div>
        )}
      </Container>
    </div>
  );
}
