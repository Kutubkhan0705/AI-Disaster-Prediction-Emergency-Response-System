import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { getAlerts } from "../services/disasterService.js";
import { socket } from "../services/socket.js";

const severityColor = { critical: "#dc3545", high: "#fd7e14", moderate: "#ffc107", warning: "#ffc107", low: "#0dcaf0", info: "#0dcaf0" };
const severityIcon  = { critical: "🚨", high: "⚠️", moderate: "🔶", warning: "🔶", low: "ℹ️", info: "ℹ️" };

function useLocationName(coordinates) {
  const [name, setName] = useState(null);

  useEffect(() => {
    if (!coordinates || coordinates[0] === 0 && coordinates[1] === 0) return;
    const [lon, lat] = coordinates;
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
      .then((r) => r.json())
      .then((d) => {
        const addr = d.address;
        const place = addr?.city || addr?.town || addr?.village || addr?.county || addr?.state || "Unknown Location";
        const state = addr?.state || "";
        const country = addr?.country_code?.toUpperCase() || "";
        setName(`${place}${state && state !== place ? ", " + state : ""}${country ? " " + country : ""}`);
      })
      .catch(() => setName(null));
  }, [coordinates?.join(",")]);

  return name;
}

function AlertCard({ alert }) {
  const color = severityColor[alert.severity] || "#6c757d";
  const icon  = severityIcon[alert.severity]  || "🔔";
  const coords = alert.location?.coordinates;
  const hasCoords = coords && !(coords[0] === 0 && coords[1] === 0);
  const locationName = useLocationName(hasCoords ? coords : null);
  const [lon, lat] = coords || [0, 0];

  return (
    <div style={{ background: "var(--bg-card)", borderRadius: 14, padding: 20, border: `1px solid var(--border-color)`, borderLeft: `4px solid ${color}`, boxShadow: "var(--card-shadow)", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{ background: color, color: ["moderate","warning","low","info"].includes(alert.severity) ? "#212529" : "#fff", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
          {alert.severity}
        </span>
      </div>

      {/* Title & message */}
      <h6 style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: 6 }}>{alert.title}</h6>
      <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 12, flex: 1 }}>{alert.message}</p>

      {/* GPS Location Info */}
      {hasCoords && (
        <div style={{ background: "var(--bg-main)", borderRadius: 10, padding: "10px 12px", marginBottom: 10, border: "1px solid var(--border-color)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6, letterSpacing: 0.5 }}>📍 LOCATION</div>
          {locationName && (
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
              🏙️ {locationName}
            </div>
          )}
          <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--text-secondary)" }}>
            <span>🌐 Lat: <strong style={{ color: "var(--text-primary)" }}>{lat.toFixed(4)}</strong></span>
            <span>🌐 Lon: <strong style={{ color: "var(--text-primary)" }}>{lon.toFixed(4)}</strong></span>
          </div>
          <a
            href={`https://www.google.com/maps?q=${lat},${lon}`}
            target="_blank"
            rel="noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 11, color: "#0d6efd", textDecoration: "none", fontWeight: 600 }}
          >
            🗺️ View on Google Maps →
          </a>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-secondary)" }}>
        <span style={{ textTransform: "uppercase", fontWeight: 600, background: "var(--bg-main)", padding: "2px 8px", borderRadius: 6 }}>{alert.type}</span>
        <span>{alert.createdAt ? new Date(alert.createdAt).toLocaleString() : ""}</span>
      </div>
    </div>
  );
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    getAlerts().then(setAlerts).catch(() => {});
    const onNew      = (a) => setAlerts((p) => [a, ...p]);
    const onResolved = (r) => setAlerts((p) => p.filter((a) => a._id !== r._id));
    socket.on("alert:new", onNew);
    socket.on("alert:resolved", onResolved);
    return () => { socket.off("alert:new", onNew); socket.off("alert:resolved", onResolved); };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", padding: "32px 0" }}>
      <Container>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#dc3545,#7b0d1e)", borderRadius: 18, padding: "28px 32px", marginBottom: 28, color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🔔</div>
              <div>
                <h3 style={{ margin: 0, fontWeight: 700 }}>Active Alerts</h3>
                <p style={{ margin: 0, opacity: 0.8, fontSize: 14 }}>Real-time disaster alerts with GPS location tracking</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", padding: "6px 14px", borderRadius: 20 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", display: "inline-block", animation: "livePulse 1.5s infinite" }}></span>
                <span style={{ fontSize: 12, fontWeight: 700 }}>LIVE</span>
              </div>
              <span style={{ fontSize: 11, opacity: 0.7 }}>{alerts.length} active alert{alerts.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: "60px 20px", textAlign: "center", border: "1px solid var(--border-color)", boxShadow: "var(--card-shadow)" }}>
            <div style={{ fontSize: 56 }}>🛡️</div>
            <h4 style={{ color: "var(--text-primary)", marginTop: 16, fontWeight: 700 }}>No Active Alerts</h4>
            <p style={{ color: "var(--text-secondary)" }}>All clear! No disaster alerts at this time.</p>
          </div>
        ) : (
          <Row className="g-3">
            {alerts.map((alert) => (
              <Col md={6} lg={4} key={alert._id}>
                <AlertCard alert={alert} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}
