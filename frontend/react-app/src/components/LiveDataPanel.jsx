import React from "react";

const FIELDS = [
  { key: "temperature",     label: "Temperature",        unit: "°C",   icon: "🌡️" },
  { key: "humidity",        label: "Humidity",           unit: "%",    icon: "💧" },
  { key: "pressure",        label: "Pressure",           unit: "hPa",  icon: "🔵" },
  { key: "windSpeed",       label: "Wind Speed",         unit: "km/h", icon: "💨" },
  { key: "rainfall",        label: "Rainfall",           unit: "mm",   icon: "🌧️" },
  { key: "elevation",       label: "Elevation",          unit: "m",    icon: "⛰️" },
  { key: "riverLevel",      label: "River Level (est.)", unit: "m",    icon: "🏞️" },
  { key: "riverDischarge",  label: "River Discharge",    unit: "m³/s", icon: "🌊" },
  { key: "seaSurfaceTemp",  label: "Sea Surface Temp",   unit: "°C",   icon: "🌊" },
  { key: "waveHeight",      label: "Wave Height",        unit: "m",    icon: "🌊" },
  { key: "distanceToCoast", label: "Distance to Coast",  unit: "km",   icon: "🗺️" },
];

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export default function LiveDataPanel({ liveData, accentColor = "#0d6efd" }) {
  if (!liveData) return null;
  const available = FIELDS.filter((f) => liveData[f.key] != null);
  if (available.length === 0) return null;

  return (
    <div style={{
      marginTop: 16,
      padding: "14px 16px",
      background: `rgba(${hexToRgb(accentColor)}, 0.06)`,
      border: `1px solid rgba(${hexToRgb(accentColor)}, 0.25)`,
      borderRadius: 12,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: accentColor, marginBottom: 10 }}>
        🌐 Live Data Fetched — {available.length} fields auto-filled
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
        {available.map(({ key, label, unit, icon }) => (
          <div key={key} style={{
            background: "var(--bg-card)",
            borderRadius: 8,
            padding: "8px 10px",
            border: `1px solid rgba(${hexToRgb(accentColor)}, 0.2)`,
          }}>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 2 }}>{icon} {label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: accentColor }}>
              {liveData[key]}
              <span style={{ fontSize: 11, fontWeight: 400 }}> {unit}</span>
              {key === "seaSurfaceTemp" && liveData.sstEstimated && (
                <span style={{ fontSize: 10, color: "var(--text-secondary)", marginLeft: 4 }}>(est.)</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
