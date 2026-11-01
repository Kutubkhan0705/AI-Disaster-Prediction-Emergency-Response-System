import React, { useEffect, useState } from "react";
import { Container, Form, Row, Col, Alert } from "react-bootstrap";
import { toast } from "react-toastify";
import { predictEarthquake, getRecentEarthquakes } from "../services/disasterService.js";
import PredictionResultCard from "../components/PredictionResultCard.jsx";
import LocationSearch from "../components/LocationSearch.jsx";
import { useAutoFill } from "../hooks/useAutoFill.js";
import LiveDataPanel from "../components/LiveDataPanel.jsx";

const initialForm = { lat: "", lon: "", depth: "", historicalMagnitude: "", faultDistance: "" };

export default function EarthquakePrediction() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [recent, setRecent] = useState([]);
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

  useEffect(() => {
    getRecentEarthquakes({ minMagnitude: 4, days: 7 }).then(setRecent).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const payload = {
        lat: form.lat ? Number(form.lat) : undefined,
        lon: form.lon ? Number(form.lon) : undefined,
        depth: form.depth ? Number(form.depth) : undefined,
        historicalMagnitude: form.historicalMagnitude ? Number(form.historicalMagnitude) : undefined,
        faultDistance: form.faultDistance ? Number(form.faultDistance) : undefined,
      };
      const data = await predictEarthquake(payload);
      setResult(data);
      toast.info(`Prediction: ${data.predictionResult.label}`);
    } catch (err) {
      setError(err.response?.data?.message || "Prediction failed. Are you logged in?");
    } finally { setLoading(false); }
  };

  const getMagColor = (mag) => mag >= 6 ? "#dc3545" : mag >= 5 ? "#fd7e14" : "#ffc107";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", padding: "32px 0" }}>
      <Container>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #dc3545, #7b0d1e)", borderRadius: 18, padding: "28px 32px", marginBottom: 28, color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🌎</div>
            <div>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Earthquake Risk Prediction</h3>
              <p style={{ margin: 0, opacity: 0.8, fontSize: 14 }}>Seismic risk analysis using depth, fault distance & historical data</p>
            </div>
          </div>
        </div>

        <Row className="g-4">
          {/* Form */}
          <Col lg={7}>
            <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 28, border: "1px solid var(--border-color)", boxShadow: "var(--card-shadow)" }}>
              <h5 style={{ color: "var(--text-primary)", marginBottom: 20, fontWeight: 600 }}>📍 Location & Seismic Parameters</h5>
              {error && <Alert variant="danger" style={{ borderRadius: 10 }}>{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={12}>
                    <LocationSearch onSelect={({ lat, lon, display_name }) => applyLocation(lat, lon, display_name?.split(",")[0] || "")} />
                  </Col>
                  <Col md={12} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <button type="button" onClick={getLocation} disabled={locLoading || weatherLoading}
                      style={{ background: "rgba(220,53,69,0.1)", border: "1px solid rgba(220,53,69,0.3)", borderRadius: 8, padding: "7px 16px", cursor: (locLoading || weatherLoading) ? "not-allowed" : "pointer", color: "#dc3545", fontSize: 13, fontWeight: 600 }}>
                      📍 {locLoading ? "Detecting..." : weatherLoading ? "⏳ Fetching weather..." : "Use My Location"}
                    </button>
                    {locationName && (
                      <span style={{ background: "rgba(220,53,69,0.1)", color: "#dc3545", borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 600 }}>📌 {locationName}</span>
                    )}
                  </Col>
                  {[
                    { label: "Latitude", name: "lat" },
                    { label: "Longitude", name: "lon" },
                  ].map(({ label, name }) => (
                    <Col md={6} key={name}>
                      <Form.Label style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 600 }}>{label}</Form.Label>
                      <Form.Control type="number" step="any" name={name} value={form[name]} onChange={handleChange} style={{ borderRadius: 10 }} />
                    </Col>
                  ))}
                  {[
                    { label: "🔻 Depth (km)", name: "depth" },
                    { label: "📊 Historical Avg Magnitude", name: "historicalMagnitude" },
                    { label: "📏 Fault Distance (km)", name: "faultDistance" },
                  ].map(({ label, name }) => (
                    <Col md={4} key={name}>
                      <Form.Label style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 600 }}>{label}</Form.Label>
                      <Form.Control type="number" step="any" name={name} value={form[name]} onChange={handleChange} style={{ borderRadius: 10 }} />
                    </Col>
                  ))}
                </Row>
                <LiveDataPanel liveData={liveData} accentColor="#dc3545" />
                <button type="submit" disabled={loading}
                  style={{ marginTop: 24, width: "100%", padding: "12px", borderRadius: 10, border: "none", background: loading ? "#6c757d" : "linear-gradient(135deg,#dc3545,#7b0d1e)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.3s" }}>
                  {loading ? "⏳ Predicting..." : "🔍 Run Earthquake Prediction"}
                </button>
              </Form>
              {result && <div style={{ marginTop: 20 }}><PredictionResultCard result={result} type="earthquake" /></div>}
            </div>
          </Col>

          {/* Recent Activity */}
          <Col lg={5}>
            <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 24, border: "1px solid var(--border-color)", boxShadow: "var(--card-shadow)", height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h5 style={{ color: "var(--text-primary)", fontWeight: 600, margin: 0 }}>🌐 Recent Seismic Activity</h5>
                <span style={{ background: "rgba(220,53,69,0.1)", color: "#dc3545", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>USGS LIVE</span>
              </div>
              <div style={{ maxHeight: 420, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {recent.length === 0 && <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>No recent data available.</p>}
                {recent.map((eq) => (
                  <div key={eq.id} style={{ background: "var(--bg-main)", borderRadius: 10, padding: "10px 14px", border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, color: getMagColor(eq.magnitude), fontSize: 15 }}>M {eq.magnitude}</span>
                      <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{new Date(eq.time).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3 }}>{eq.place}</div>
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
