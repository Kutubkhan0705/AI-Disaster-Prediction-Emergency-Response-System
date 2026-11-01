import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useTheme } from "../context/ThemeContext.jsx";

export default function NavBar({ user, onLogout }) {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <Navbar expand="lg" sticky="top" className="shadow-sm" style={{ backgroundColor: "var(--bg-navbar)" }}>
      <Container>
        <Navbar.Brand as={Link} to="/" style={{ color: "var(--text-nav)", fontWeight: 700 }}>
          🛡️ AI Disaster System
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            {["/", "/flood", "/earthquake", "/cyclone", "/about", "/map", "/alerts"].map((path) => {
              const labels = { "/": "Dashboard", "/flood": "Flood", "/earthquake": "Earthquake", "/cyclone": "Cyclone", "/about": "About", "/map": "Live Map", "/alerts": "Alerts" };
              return (
                <Nav.Link key={path} as={Link} to={path} style={{ color: "var(--text-nav)" }}>
                  {labels[path]}
                </Nav.Link>
              );
            })}
          </Nav>
          <Nav className="align-items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggle}
              title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: 20,
                padding: "4px 12px",
                cursor: "pointer",
                fontSize: 16,
                color: "#fff",
                transition: "all 0.3s",
              }}
            >
              {dark ? "☀️ Light" : "🌙 Dark"}
            </button>

            {user ? (
              <>
                <Navbar.Text style={{ color: "var(--text-nav)" }} className="me-2">
                  👤 <strong>{user.name}</strong>
                </Navbar.Text>
                <Button size="sm" variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" style={{ color: "var(--text-nav)" }}>Login</Nav.Link>
                <Nav.Link as={Link} to="/register" style={{ color: "var(--text-nav)" }}>Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
