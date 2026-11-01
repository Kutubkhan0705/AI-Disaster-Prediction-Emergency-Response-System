import React from "react";
import { Container } from "react-bootstrap";

export default function Footer() {
  return (
    <footer style={{ background: "var(--bg-navbar)", color: "var(--text-nav)", transition: "background 0.3s ease" }} className="py-3 mt-5">
      <Container className="text-center small">
        &copy; {new Date().getFullYear()} AI Disaster Prediction & Alert System. Built for public safety.
      </Container>
    </footer>
  );
}
