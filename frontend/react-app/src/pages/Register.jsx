import React, { useState } from "react";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaShieldAlt,
  FaArrowRight,
} from "react-icons/fa";

import "./Register.css";

export default function Register({ onRegister }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onRegister(form);
      toast.success("Account created!");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-bg-circle circle-one"></div>
      <div className="register-bg-circle circle-two"></div>

      <Container className="register-container">
        <Card className="register-card shadow-lg border-0">
          <Card.Body>

            {/* Header */}
            <div className="register-header">
              <div className="register-icon">
                <FaShieldAlt />
              </div>

              <h2>Create Account</h2>

              <p>
                Join <span>DisasterAI</span> and stay prepared.
              </p>
            </div>

            {error && (
              <Alert variant="danger" className="register-alert">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>

              {/* Name */}
              <Form.Group className="register-form-group">
                <Form.Label>Full Name</Form.Label>

                <div className="register-input-wrapper">
                  <FaUser className="register-input-icon" />

                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </Form.Group>

              {/* Email */}
              <Form.Group className="register-form-group">
                <Form.Label>Email Address</Form.Label>

                <div className="register-input-wrapper">
                  <FaEnvelope className="register-input-icon" />

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

              {/* Phone */}
              <Form.Group className="register-form-group">
                <Form.Label>Phone Number</Form.Label>

                <div className="register-input-wrapper">
                  <FaPhone className="register-input-icon" />

                  <Form.Control
                    type="text"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </Form.Group>

              {/* Password */}
              <Form.Group className="register-form-group">
                <Form.Label>Password</Form.Label>

                <div className="register-input-wrapper">
                  <FaLock className="register-input-icon" />

                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Create a password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>

                <small className="password-hint">
                  Password must be at least 6 characters.
                </small>
              </Form.Group>

              {/* Button */}
              <Button
                type="submit"
                className="register-btn w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      animation="border"
                      size="sm"
                      className="me-2"
                    />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <FaArrowRight className="ms-2" />
                  </>
                )}
              </Button>
            </Form>

            {/* Login */}
            <div className="register-login">
              Already have an account?{" "}
              <Link to="/login">Sign In</Link>
            </div>

          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}