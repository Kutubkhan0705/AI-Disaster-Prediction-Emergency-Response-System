
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { getAlerts } from "../services/disasterService.js";
import { socket } from "../services/socket.js";
import AlertCard from "../components/AlertCard.jsx";
import "./Dashboard.css";

export default function Dashboard() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    getAlerts().then(setAlerts).catch(() => {});

    const handleNewAlert = (alert) => {
      setAlerts((prev) => [alert, ...prev]);
    };

    socket.on("alert:new", handleNewAlert);

    return () => socket.off("alert:new", handleNewAlert);
  }, []);

  return (
    <Container fluid className="dashboard-container py-4">
      
      {/* Header */}
      <Container>
        <div className="dashboard-header mb-4">
          <h2>Disaster Monitoring Dashboard</h2>
          <p>
            Monitor disaster risks, predictions and live emergency alerts.
          </p>
        </div>

        {/* Feature Cards */}
        <Row className="g-4 mb-5">

          {/* Flood */}
          <Col md={4}>
            <Card
              as={Link}
              to="/flood"
              className="dashboard-card flood-card text-decoration-none"
            >
              <Card.Body className="text-center">
                <div className="dashboard-icon flood-icon">
                  <i className="bi bi-water"></i>
                </div>

                <Card.Title className="mt-3">
                  Flood Prediction
                </Card.Title>

                <Card.Text>
                  Run an ML-based flood risk check for a location.
                </Card.Text>

                <span className="dashboard-btn">
                  Check Flood Risk →
                </span>
              </Card.Body>
            </Card>
          </Col>

          {/* Earthquake */}
          <Col md={4}>
            <Card
              as={Link}
              to="/earthquake"
              className="dashboard-card earthquake-card text-decoration-none"
            >
              <Card.Body className="text-center">
                <div className="dashboard-icon earthquake-icon">
                  <i className="bi bi-activity"></i>
                </div>

                <Card.Title className="mt-3">
                  Earthquake Prediction
                </Card.Title>

                <Card.Text>
                  Estimate seismic risk for a particular location.
                </Card.Text>

                <span className="dashboard-btn">
                  Check Earthquake Risk →
                </span>
              </Card.Body>
            </Card>
          </Col>

          {/* Map */}
          <Col md={4}>
            <Card
              as={Link}
              to="/map"
              className="dashboard-card map-card text-decoration-none"
            >
              <Card.Body className="text-center">
                <div className="dashboard-icon map-icon">
                  <i className="bi bi-geo-alt-fill"></i>
                </div>

                <Card.Title className="mt-3">
                  Live Disaster Map
                </Card.Title>

                <Card.Text>
                  View active disaster events geographically.
                </Card.Text>

                <span className="dashboard-btn">
                  Open Live Map →
                </span>
              </Card.Body>
            </Card>
          </Col>

        </Row>

        {/* Live Alerts */}
        <div className="alerts-section">

          <div className="alerts-heading">
            <div>
              <h4>
                <i className="bi bi-broadcast text-danger me-2"></i>
                Live Alerts
              </h4>

              <p>
                Real-time disaster alerts and emergency information
              </p>
            </div>

            <span className="live-badge">
              <span className="live-dot"></span>
              LIVE
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="no-alerts">
              <i className="bi bi-shield-check"></i>
              <h5>No Active Alerts</h5>
              <p>No active disaster alerts right now.</p>
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

        </div>
      </Container>
    </Container>
  );
}

