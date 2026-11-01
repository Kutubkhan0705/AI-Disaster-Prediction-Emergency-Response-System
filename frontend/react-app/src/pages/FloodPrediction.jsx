import React, { useState } from "react";
import { Container, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { toast } from "react-toastify";
import { predictFlood } from "../services/disasterService.js";
import PredictionResultCard from "../components/PredictionResultCard.jsx";
import LocationSearch from "../components/LocationSearch.jsx";
import { useAutoFill } from "../hooks/useAutoFill.js";
import LiveDataPanel from "../components/LiveDataPanel.jsx";

const initialForm = { lat: "", lon: "", rainfall: "", riverLevel: "", elevation: "" };

export default function FloodPrediction() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const { fetchWeather, weatherLoading, liveData } = useAutoFill();
  const [locationName, setLocationName] = useState("");

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
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, { headers: { "Accept-Language": "en" } });
          const d = await res.json();
          const name = d.address?.city || d.address?.town || d.address?.state || d.display_name?.split(",")[0] || "";
          applyLocation(lat, lon, name);
        } catch { applyLocation(lat, lon); }
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
        lat: form.lat ? Number(form.lat) : undefined,
        lon: form.lon ? Number(form.lon) : undefined,
        rainfall: form.rainfall ? Number(form.rainfall) : undefined,
        riverLevel: form.riverLevel ? Number(form.riverLevel) : undefined,
        elevation: form.elevation ? Number(form.elevation) : undefined,
      };
      const data = await predictFlood(payload);
      setResult(data);
      toast.info(`Prediction: ${data.predictionResult.label}`);
    } catch (err) {
      setError(err.response?.data?.message || "Prediction failed. Are you logged in?");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", padding: "32px 0" }}>
      <Container>
        {/* Page Header */}
        <div style={{ background: "linear-gradient(135deg, #0d6efd, #0b3d91)", borderRadius: 18, padding: "28px 32px", marginBottom: 28, color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🌊</div>
            <div>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Flood Risk Prediction</h3>
              <p style={{ margin: 0, opacity: 0.8, fontSize: 14 }}>ML-based flood risk analysis using weather & terrain data</p>
            </div>
          </div>
        </div>

        <Row className="g-4">
          <Col lg={7}>
            <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 28, border: "1px solid var(--border-color)", boxShadow: "var(--card-shadow)" }}>
              <h5 style={{ color: "var(--text-primary)", marginBottom: 20, fontWeight: 600 }}>📍 Location & Parameters</h5>
              {error && <Alert variant="danger" style={{ borderRadius: 10 }}>{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={12}>
                    <LocationSearch onSelect={({ lat, lon, display_name }) => applyLocation(lat, lon, display_name?.split(",")[0] || "")} />
                  </Col>
                  <Col md={12} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <button type="button" onClick={getLocation} disabled={locLoading || weatherLoading}
                      style={{ background: "rgba(13,110,253,0.1)", border: "1px solid rgba(13,110,253,0.3)", borderRadius: 8, padding: "7px 16px", cursor: (locLoading || weatherLoading) ? "not-allowed" : "pointer", color: "#0d6efd", fontSize: 13, fontWeight: 600 }}>
                      📍 {locLoading ? "Detecting..." : weatherLoading ? "⏳ Fetching weather..." : "Use My Location"}
                    </button>
                    {locationName && (
                      <span style={{ background: "rgba(13,110,253,0.1)", color: "#0d6efd", borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 600 }}>📌 {locationName}</span>
                    )}
                  </Col>
                  {[
                    { label: "Latitude", name: "lat", placeholder: "e.g. 26.8467" },
                    { label: "Longitude", name: "lon", placeholder: "e.g. 80.9462" },
                  ].map(({ label, name, placeholder }) => (
                    <Col md={6} key={name}>
                      <Form.Label style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 600 }}>{label}</Form.Label>
                      <Form.Control type="number" step="any" name={name} value={form[name]} onChange={handleChange} placeholder={placeholder} style={{ borderRadius: 10 }} />
                    </Col>
                  ))}
                  {[
                    { label: "🌧️ Rainfall (mm)", name: "rainfall" },
                    { label: "🏞️ River Level (m)", name: "riverLevel" },
                    { label: "⛰️ Elevation (m)", name: "elevation" },
                  ].map(({ label, name }) => (
                    <Col md={4} key={name}>
                      <Form.Label style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 600 }}>
                        {label}
                        {form[name] && <span style={{ marginLeft: 6, fontSize: 10, color: "#0d6efd", fontWeight: 700 }}>● LIVE</span>}
                      </Form.Label>
                      <Form.Control type="number" step="any" name={name} value={form[name]} onChange={handleChange}
                        style={{ borderRadius: 10, borderColor: form[name] ? "#0d6efd" : undefined, boxShadow: form[name] ? "0 0 0 2px rgba(13,110,253,0.15)" : undefined }} />
                    </Col>
                  ))}
                </Row>
                <LiveDataPanel liveData={liveData} accentColor="#0d6efd" />
                <button type="submit" disabled={loading}
                  style={{ marginTop: 24, width: "100%", padding: "12px", borderRadius: 10, border: "none", background: loading ? "#6c757d" : "linear-gradient(135deg,#0d6efd,#0b3d91)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.3s" }}>
                  {loading ? "⏳ Predicting..." : "🔍 Run Flood Prediction"}
                </button>
              </Form>
            </div>
          </Col>

          <Col lg={5}>
            <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 24, border: "1px solid var(--border-color)", boxShadow: "var(--card-shadow)", height: "100%" }}>
              <h5 style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: 16 }}>ℹ️ How It Works</h5>
              {[
                { icon: "🌧️", title: "Rainfall Data", desc: "Auto-fetched from OpenWeatherMap if left blank" },
                { icon: "🏞️", title: "River Level", desc: "Current water level in meters" },
                { icon: "⛰️", title: "Elevation", desc: "Terrain height affects flood risk" },
                { icon: "🤖", title: "ML Model", desc: "scikit-learn model predicts risk score 0–1" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, padding: 12, background: "var(--bg-main)", borderRadius: 10 }}>
                  <span style={{ fontSize: 22 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Col>
        </Row>

        {result && (
          <div style={{ marginTop: 24 }}>
            <PredictionResultCard result={result} type="flood" />
          </div>
        )}
      </Container>
    </div>
  );
}
