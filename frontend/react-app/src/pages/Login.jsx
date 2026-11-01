
import React, { useState } from "react";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaShieldAlt,
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaBrain,
} from "react-icons/fa";

import "./Login.css";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await onLogin(form);

      toast.success("Welcome back!");

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Background Effects */}
      <div className="login-bg-circle circle-one"></div>
      <div className="login-bg-circle circle-two"></div>

      <Container className="login-container">

        <div className="login-wrapper">

          {/* LEFT SIDE */}
          <div className="login-info">

            <div className="login-brand">
              <div className="brand-icon">
                <FaShieldAlt />
              </div>

              <div>
                <h4>DisasterAI</h4>
                <span>Intelligent Safety System</span>
              </div>
            </div>

            <div className="login-info-content">

              <div className="ai-badge">
                <FaBrain />
                AI POWERED PROTECTION
              </div>

              <h1>
                Stay Alert.
                <br />
                <span>Stay Safe.</span>
              </h1>

              <p>
                Access your disaster monitoring dashboard and
                stay informed about potential risks around you.
              </p>

              <div className="login-features">

                <div>
                  <FaShieldAlt />
                  <span>AI-powered disaster prediction</span>
                </div>

                <div>
                  <FaArrowRight />
                  <span>Real-time risk monitoring</span>
                </div>

                <div>
                  <FaArrowRight />
                  <span>Emergency response support</span>
                </div>

              </div>

            </div>

          </div>

          {/* RIGHT SIDE */}
          <Card className="login-card">

            <Card.Body>

              <div className="login-card-header">

                <div className="mobile-brand-icon">
                  <FaShieldAlt />
                </div>

                <h2>Welcome Back</h2>

                <p>
                  Sign in to access your disaster dashboard
                </p>

              </div>

              {error && (
                <Alert
                  variant="danger"
                  className="login-alert"
                >
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>

                {/* EMAIL */}
                <Form.Group className="login-form-group">

                  <Form.Label>
                    Email Address
                  </Form.Label>

                  <div className="input-wrapper">

                    <FaEnvelope />

                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />

                  </div>

                </Form.Group>

                {/* PASSWORD */}
                <Form.Group className="login-form-group">

                  <Form.Label>
                    Password
                  </Form.Label>

                  <div className="input-wrapper">

                    <FaLock />

                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />

                  </div>

                </Form.Group>

                {/* BUTTON */}
                <Button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                >

                  {loading ? (
                    <>
                      <Spinner
                        animation="border"
                        size="sm"
                      />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <FaArrowRight />
                    </>
                  )}

                </Button>

              </Form>

              <div className="login-divider">
                <span>OR</span>
              </div>

              <div className="register-text">

                Don't have an account?

                <Link to="/register">
                  Create Account
                </Link>

              </div>

              <div className="security-note">

                <FaShieldAlt />

                <span>
                  Your information is securely protected.
                </span>

              </div>

            </Card.Body>

          </Card>

        </div>

      </Container>

    </div>
  );
}

