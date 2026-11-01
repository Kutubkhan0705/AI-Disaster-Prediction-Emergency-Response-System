import React from "react";

export default function PredictionResultCard({ result, type }) {
  if (!result) return null;
  const { predictionResult } = result;
  const score   = predictionResult?.riskScore ?? predictionResult?.probability ?? 0;
  const percent = Math.round(score * 100);
  const color   = percent >= 80 ? "#dc3545" : percent >= 50 ? "#fd7e14" : "#198754";
  const emoji   = percent >= 80 ? "🚨" : percent >= 50 ? "⚠️" : "✅";

  return (
    <div style={{ background: "var(--bg-card)", borderRadius: 14, padding: 24, border: `2px solid ${color}`, boxShadow: `0 4px 20px ${color}30`, marginTop: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h5 style={{ margin: 0, color: "var(--text-primary)", fontWeight: 700 }}>
          {emoji} {type === "flood" ? "Flood Risk Result" : type === "cyclone" ? "Cyclone Risk Result" : "Earthquake Risk Result"}
        </h5>
        <span style={{ background: color, color: "#fff", padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
          {predictionResult?.label}
        </span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Risk Score</span>
          <span style={{ fontSize: 13, fontWeight: 700, color }}>{percent}%</span>
        </div>
        <div style={{ background: "var(--bg-main)", borderRadius: 8, height: 12, overflow: "hidden" }}>
          <div style={{ width: `${percent}%`, height: "100%", background: color, borderRadius: 8, transition: "width 1s ease" }} />
        </div>
      </div>

      {predictionResult?.magnitude && (
        <div style={{ background: "var(--bg-main)", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Estimated Magnitude</span>
          <span style={{ fontWeight: 700, color, fontSize: 15 }}>{predictionResult.magnitude}</span>
        </div>
      )}
      {predictionResult?.category !== undefined && type === "cyclone" && (
        <div style={{ background: "var(--bg-main)", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Cyclone Category</span>
          <span style={{ fontWeight: 700, color, fontSize: 15 }}>Cat {predictionResult.category}</span>
        </div>
      )}
    </div>
  );
}
