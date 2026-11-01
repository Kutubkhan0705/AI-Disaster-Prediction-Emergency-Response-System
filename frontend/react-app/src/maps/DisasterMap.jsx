import React from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const TYPE_CONFIG = {
  earthquake: { color: "#dc3545", emoji: "🌎", radius: 10 },
  flood:      { color: "#0d6efd", emoji: "🌊", radius: 10 },
  cyclone:    { color: "#6f42c1", emoji: "🌀", radius: 12 },
  other:      { color: "#6c757d", emoji: "⚠️", radius: 8  },
};

const SEVERITY_OPACITY = { critical: 0.85, high: 0.7, moderate: 0.55, low: 0.4 };

function getConfig(d) {
  return TYPE_CONFIG[d.type] || TYPE_CONFIG.other;
}

// Auto-fit map bounds when markers change
function FitBounds({ markers }) {
  const map = useMap();
  React.useEffect(() => {
    if (markers.length === 0) return;
    const valid = markers.filter((d) => {
      const [lng, lat] = d.location?.coordinates || d.coordinates || [];
      return lat != null && lng != null && lat !== 0 && lng !== 0;
    });
    if (valid.length === 0) return;
    const bounds = valid.map((d) => {
      const [lng, lat] = d.location?.coordinates || d.coordinates || [];
      return [lat, lng];
    });
    try { map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 }); } catch {}
  }, [markers.length]);
  return null;
}

export default function DisasterMap({ disasters = [], liveIds = new Set(), center = [20.5937, 78.9629], zoom = 4 }) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: "520px", width: "100%", borderRadius: 10 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds markers={disasters} />
      {disasters.map((d) => {
        const [lng, lat] = d.location?.coordinates || d.coordinates || [];
        if (lat == null || lng == null) return null;
        const cfg   = getConfig(d);
        const isLive = liveIds.has(d._id || d.id);
        const opacity = SEVERITY_OPACITY[d.severity] || 0.6;
        const radius  = isLive ? cfg.radius + 4 : cfg.radius;

        return (
          <CircleMarker
            key={d._id || d.id}
            center={[lat, lng]}
            radius={radius}
            pathOptions={{
              color:       cfg.color,
              fillColor:   cfg.color,
              fillOpacity: opacity,
              weight:      isLive ? 3 : 1.5,
              dashArray:   isLive ? "4 2" : undefined,
            }}
          >
            <Popup>
              <div style={{ minWidth: 180 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                  {cfg.emoji} {d.title || d.place || "Event"}
                </div>
                <div style={{ fontSize: 12, color: "#555", marginBottom: 6 }}>
                  {d.description || (d.magnitude ? `Magnitude: ${d.magnitude}` : "")}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ background: cfg.color, color: "#fff", borderRadius: 10, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
                    {(d.type || "earthquake").toUpperCase()}
                  </span>
                  {d.severity && (
                    <span style={{ background: "#f0f0f0", borderRadius: 10, padding: "2px 8px", fontSize: 11 }}>
                      {d.severity}
                    </span>
                  )}
                  {d.magnitude && (
                    <span style={{ background: "#fff3cd", borderRadius: 10, padding: "2px 8px", fontSize: 11 }}>
                      M {d.magnitude}
                    </span>
                  )}
                  {isLive && (
                    <span style={{ background: "#dc3545", color: "#fff", borderRadius: 10, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                      🔴 LIVE
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 6 }}>
                  📍 {lat.toFixed(3)}, {lng.toFixed(3)}
                  {d.createdAt && <span style={{ marginLeft: 8 }}>{new Date(d.createdAt).toLocaleDateString()}</span>}
                  {d.time && <span style={{ marginLeft: 8 }}>{new Date(d.time).toLocaleDateString()}</span>}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
