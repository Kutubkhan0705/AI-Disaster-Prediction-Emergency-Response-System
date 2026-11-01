import React from "react";
import { Card, Badge } from "react-bootstrap";

const severityIcon = {
  critical: "bi-exclamation-octagon-fill",
  danger: "bi-exclamation-triangle-fill",
  warning: "bi-exclamation-circle-fill",
  info: "bi-info-circle-fill",
};

export default function AlertCard({ alert }) {
  return (
    <Card className="mb-3 shadow-sm card-hover border-0 border-start border-4"
      style={{ borderLeftColor: "var(--bs-danger)" }}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <Card.Title className="mb-1">
            <i className={`bi ${severityIcon[alert.severity] || "bi-bell-fill"} me-2`}></i>
            {alert.title}
          </Card.Title>
          <Badge className={`severity-${alert.severity} text-uppercase`}>
            {alert.severity}
          </Badge>
        </div>
        <Card.Subtitle className="mb-2 text-muted small">
          {alert.type?.toUpperCase()} {alert.region ? `• ${alert.region}` : ""}
        </Card.Subtitle>
        <Card.Text>{alert.message}</Card.Text>
        <div className="text-muted small">
          {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : ""}
        </div>
      </Card.Body>
    </Card>
  );
}
