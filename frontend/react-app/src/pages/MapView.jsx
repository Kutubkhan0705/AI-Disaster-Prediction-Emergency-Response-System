import React, { useEffect, useState, useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import DisasterMap from "../maps/DisasterMap.jsx";
import { getRecentEarthquakes, getDisasters } from "../services/disasterService.js";
import { socket } from "../services/socket.js";

const FILTERS = ["all", "earthquake", "flood", "cyclone"];

const TYPE_COLOR = {
  earthquake: "#dc3545",
  flood:      "#0d6efd",
  cyclone:    "#6f42c1",
  other:      "#6c757d",
};

const TYPE_EMOJI = { earthquake: "🌎", flood: "🌊", cyclone: "🌀", other: "⚠️" };

export default function MapView() {
  const [dbDisasters,  setDbDisasters]  = useState([]);
  const [earthquakes,  setEarthquakes]  = useState([]);
  const [liveEvents,   setLiveEvents]   = useState([]);
  const [liveIds,      setLiveIds]      = useState(new Set());
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    // Load all saved disasters from DB
    getDisasters({ limit: 200 })
      .then(setDbDisasters)
      .catch(() => {})
      .finally(() => setLoading(false));

    // Load USGS earthquakes (last 14 days, M3+)
    getRecentEarthquakes({ minMagnitude: 3, days: 14 })
      .then((data) =>
        setEarthquakes(
          data.map((eq) => ({
            ...eq,
            type: "earthquake",
            severity: eq.magnitude >= 6 ? "critical" : eq.magnitude >= 5 ? "high" : "moderate",
            location: { coordinates: eq.coordinates || [eq.lon, eq.lat] },
          }))
        )
      )
      .catch(() => {});

    // Real-time socket events
    const handleNew = (d) => {
      setLiveEvents((prev) => [d, ...prev]);
      setLiveIds((prev) => new Set([...prev, d._id]));
    };
    socket.on("disaster:new", handleNew);
    return () => socket.off("disaster:new", handleNew);
  }, []);

  // Merge all sources, deduplicate by _id
  const allMarkers = useMemo(() => {
    const seen = new Set();
    const merged = [...liveEvents, ...dbDisasters, ...earthquakes];
    return merged.filter((d) => {
      const key = d._id || d.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [dbDisasters, earthquakes, liveEvents]);

  const filtered = useMemo(() =>
    activeFilter === "all" ? allMarkers : allMarkers.filter((d) => d.type === activeFilter),
    [allMarkers, activeFilter]
  );

  const counts = useMemo(() => ({
    all:        allMarkers.length,
    earthquake: allMarkers.filter((d) => d.type === "earthquake").length,
    flood:      allMarkers.filter((d) => d.type === "flood").length,
    cyclone:    allMarkers.filter((d) => d.type === "cyclone").length,
    critical:   allMarkers.filter((d) => d.severity === "critical").length,
    live:       liveEvents.length,
  }), [allMarkers, liveEvents]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", padding: "32px 0" }}>
      <Container fluid="lg">

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#198754,#0a3d22)", borderRadius: 18, padding: "28px 32px", marginBottom: 28, color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🗺️</div>
              <div>
                <h3 style={{ margin: 0, fontWeight: 700 }}>Live Disaster Map</h3>
                <p style={{ margin: 0, opacity: 0.8, fontSize: 14 }}>All flood, earthquake & cyclone events — DB + USGS + real-time</p>
              </div>
            </div>
            {/* Legend */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {Object.entries(TYPE_EMOJI).map(([type, emoji]) => (
                <div key={type} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: TYPE_COLOR[type], display: "inline-block" }} />
                  {emoji} {type.charAt(0).toUpperCase() + type.slice(1)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <Row className="g-3 mb-3">
          {[
            { icon: "🌐", label: "Total Events",  value: counts.all,        color: "#0d6efd" },
            { icon: "🌎", label: "Earthquakes",   value: counts.earthquake,  color: "#dc3545" },
            { icon: "🌊", label: "Floods",        value: counts.flood,       color: "#0d6efd" },
            { icon: "🌀", label: "Cyclones",      value: counts.cyclone,     color: "#6f42c1" },
            { icon: "🚨", label: "Critical",      value: counts.critical,    color: "#dc3545" },
            { icon: "📡", label: "Live Events",   value: counts.live,        color: "#198754" },
          ].map((s) => (
            <Col xs={6} md={4} lg={2} key={s.label}>
              <div style={{ background: "var(--bg-card)", borderRadius: 12, padding: "14px 16px", border: "1px solid var(--border-color)", boxShadow: "var(--card-shadow)", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{s.label}</div>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              style={{
                padding: "7px 18px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                background: activeFilter === f ? (TYPE_COLOR[f] || "#198754") : "var(--bg-card)",
                color: activeFilter === f ? "#fff" : "var(--text-primary)",
                boxShadow: activeFilter === f ? `0 2px 8px ${TYPE_COLOR[f] || "#198754"}55` : "none",
                transition: "all 0.2s",
              }}>
              {TYPE_EMOJI[f] || "🌐"} {f.charAt(0).toUpperCase() + f.slice(1)}
              <span style={{ marginLeft: 6, opacity: 0.8, fontSize: 11 }}>
                ({f === "all" ? counts.all : allMarkers.filter((d) => d.type === f).length})
              </span>
            </button>
          ))}
        </div>

        <Row className="g-3">
          {/* Map */}
          <Col lg={8}>
            <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 12, border: "1px solid var(--border-color)", boxShadow: "var(--card-shadow)" }}>
              {loading ? (
                <div style={{ height: 520, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                  ⏳ Loading map data...
                </div>
              ) : (
                <DisasterMap disasters={filtered} liveIds={liveIds} />
              )}
            </div>
          </Col>

          {/* Activity Sidebar */}
          <Col lg={4}>
            <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 20, border: "1px solid var(--border-color)", boxShadow: "var(--card-shadow)", height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h6 style={{ margin: 0, fontWeight: 700, color: "var(--text-primary)" }}>📋 Activity Feed</h6>
                {liveEvents.length > 0 && (
                  <span style={{ background: "#dc3545", color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
                    🔴 {liveEvents.length} LIVE
                  </span>
                )}
              </div>
              <div style={{ maxHeight: 490, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {filtered.length === 0 && (
                  <p style={{ color: "var(--text-secondary)", fontSize: 13, textAlign: "center", marginTop: 40 }}>No events found.</p>
                )}
                {filtered.slice(0, 60).map((d) => {
                  const isLive = liveIds.has(d._id || d.id);
                  const color  = TYPE_COLOR[d.type] || "#6c757d";
                  const [lng, lat] = d.location?.coordinates || d.coordinates || [];
                  return (
                    <div key={d._id || d.id}
                      style={{ background: "var(--bg-main)", borderRadius: 10, padding: "10px 12px", borderLeft: `3px solid ${color}`, position: "relative" }}>
                      {isLive && (
                        <span style={{ position: "absolute", top: 8, right: 8, background: "#dc3545", color: "#fff", borderRadius: 8, padding: "1px 6px", fontSize: 9, fontWeight: 700 }}>LIVE</span>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: 14 }}>{TYPE_EMOJI[d.type] || "⚠️"}</span>
                        <span style={{ fontWeight: 700, fontSize: 12, color: "var(--text-primary)" }}>
                          {d.title || d.place || "Event"}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{ background: color, color: "#fff", borderRadius: 8, padding: "1px 7px", fontSize: 10, fontWeight: 600 }}>
                          {(d.type || "").toUpperCase()}
                        </span>
                        {d.severity && (
                          <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>{d.severity}</span>
                        )}
                        {d.magnitude && (
                          <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>M{d.magnitude}</span>
                        )}
                      </div>
                      {lat != null && (
                        <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 4 }}>
                          📍 {Number(lat).toFixed(2)}, {Number(lng).toFixed(2)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
