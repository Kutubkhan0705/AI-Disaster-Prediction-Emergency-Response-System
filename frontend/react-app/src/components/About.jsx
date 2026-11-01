
import React from "react";
import { Link } from "react-router-dom";
import {
  FaBrain,
  FaShieldAlt,
  FaWater,
  FaMountain,
  FaCloudSun,
  FaBell,
  FaMapMarkedAlt,
  FaDatabase,
  FaPython,
  FaReact,
  FaNodeJs,
  FaLeaf,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";

import "./About.css";
const About = () => {
  const disasters = [
    {
      icon: <FaWater />,
      title: "Flood Prediction",
      description:
        "Analyze weather and environmental conditions to estimate flood risk and provide early warnings.",
    },
    {
      icon: <FaMountain />,
      title: "Earthquake Risk",
      description:
        "Machine learning models can analyze earthquake-related data to provide useful risk information.",
    },
    {
      icon: <FaCloudSun />,
      title: "Weather Monitoring",
      description:
        "Monitor real-time weather conditions to identify environmental situations that may require attention.",
    },
  ];

  const steps = [
    {
      number: "01",
      icon: <FaDatabase />,
      title: "Data Collection",
      description:
        "Collect historical, environmental, geographical and real-time weather data.",
    },
    {
      number: "02",
      icon: <FaBrain />,
      title: "AI Prediction",
      description:
        "Machine learning models analyze the collected data and generate disaster predictions.",
    },
    {
      number: "03",
      icon: <FaShieldAlt />,
      title: "Risk Analysis",
      description:
        "The prediction is processed and converted into understandable risk levels.",
    },
    {
      number: "04",
      icon: <FaBell />,
      title: "Emergency Alert",
      description:
        "Important warnings can be delivered to users so they can take timely action.",
    },
  ];

  const technologies = [
    {
      icon: <FaReact />,
      name: "React.js",
      type: "Frontend",
    },
    {
      icon: <FaNodeJs />,
      name: "Node.js",
      type: "Backend",
    },
    {
      icon: <FaDatabase />,
      name: "MongoDB",
      type: "Database",
    },
    {
      icon: <FaPython />,
      name: "Python",
      type: "Machine Learning",
    },
    {
      icon: <FaBrain />,
      name: "Scikit-learn",
      type: "AI / ML",
    },
    {
      icon: <FaMapMarkedAlt />,
      name: "Maps API",
      type: "Location Services",
    },
  ];

  return (
    <div className="about-page">

      {/* ================= HERO ================= */}
      <section className="about-hero">
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <div className="hero-badge">
            <FaBrain />
            AI Disaster System
          </div>

          <h1>
            Predict Earlier.
            <br />
            <span>Respond Faster.</span>
          </h1>

          <p>
            An intelligent disaster prediction and emergency response
            platform designed to provide early warnings, risk information,
            and emergency assistance.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">
              Explore System
              <FaArrowRight />
            </button>

            <button className="secondary-btn">
              Learn More
            </button>
          </div>
        </div>

        <div className="hero-stats">
          <div>
            <h3>AI</h3>
            <p>Powered Prediction</p>
          </div>

          <div>
            <h3>24/7</h3>
            <p>Monitoring</p>
          </div>

          <div>
            <h3>Real-Time</h3>
            <p>Risk Information</p>
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section className="about-introduction section-container">

        <div className="section-label">
          <span></span>
          ABOUT OUR SYSTEM
        </div>

        <div className="intro-grid">

          <div className="intro-heading">
            <h2>
              Technology for a
              <span> Safer Future</span>
            </h2>
          </div>

          <div className="intro-text">
            <p>
              Natural disasters can happen unexpectedly and can cause
              significant damage to people, infrastructure and the
              environment.
            </p>

            <p>
              Our AI Disaster Prediction & Emergency Response System
              combines Artificial Intelligence, Machine Learning,
              real-time weather data, maps and emergency communication
              to help people make better decisions during disaster
              situations.
            </p>

            <div className="mission-box">
              <FaLeaf />

              <div>
                <h4>Our Mission</h4>
                <p>
                  Predict risks early, spread awareness quickly and
                  support effective emergency response.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= DISASTERS ================= */}
      <section className="disaster-section">

        <div className="section-container">

          <div className="section-heading center">
            <div className="section-label">
              <span></span>
              DISASTER MONITORING
            </div>

            <h2>
              Intelligent <span>Risk Detection</span>
            </h2>

            <p>
              Our platform can integrate multiple data sources to
              understand and analyze different disaster risks.
            </p>
          </div>

          <div className="disaster-grid">

            {disasters.map((item, index) => (
              <div className="disaster-card" key={index}>

                <div className="disaster-icon">
                  {item.icon}
                </div>

                <div className="card-number">
                  0{index + 1}
                </div>

                <h3>{item.title}</h3>

                <p>{item.description}</p>

                <div className="card-link">
                  Risk Analysis
                  <FaArrowRight />
                </div>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="how-section section-container">

        <div className="section-heading center">

          <div className="section-label">
            <span></span>
            HOW IT WORKS
          </div>

          <h2>
            From Data to <span>Emergency Response</span>
          </h2>

          <p>
            Our system follows a simple intelligent workflow to
            transform data into actionable disaster information.
          </p>

        </div>

        <div className="steps-container">

          {steps.map((step, index) => (
            <div className="step" key={index}>

              <div className="step-number">
                {step.number}
              </div>

              <div className="step-icon">
                {step.icon}
              </div>

              <h3>{step.title}</h3>

              <p>{step.description}</p>

              {index < steps.length - 1 && (
                <div className="step-arrow">
                  <FaArrowRight />
                </div>
              )}

            </div>
          ))}

        </div>
      </section>

      {/* ================= EMERGENCY RESPONSE ================= */}
      <section className="response-section">

        <div className="section-container response-grid">

          <div className="response-content">

            <div className="section-label">
              <span></span>
              EMERGENCY RESPONSE
            </div>

            <h2>
              When Every
              <span> Second Matters</span>
            </h2>

            <p>
              During an emergency, quick access to accurate information
              can make a major difference. Our platform is designed to
              connect disaster prediction with emergency response tools.
            </p>

            <div className="feature-list">

              <div>
                <FaCheckCircle />
                <span>Real-time disaster information</span>
              </div>

              <div>
                <FaCheckCircle />
                <span>Risk-level visualization</span>
              </div>

              <div>
                <FaCheckCircle />
                <span>Location-based emergency information</span>
              </div>

              <div>
                <FaCheckCircle />
                <span>Map and navigation integration</span>
              </div>

              <div>
                <FaCheckCircle />
                <span>Emergency alert support</span>
              </div>

            </div>

          </div>

          <div className="response-visual">

            <div className="radar-circle">

              <div className="radar-inner">
                <FaShieldAlt />
                <span>SAFE</span>
              </div>

              <div className="radar-point point-one"></div>
              <div className="radar-point point-two"></div>
              <div className="radar-point point-three"></div>

            </div>

            <div className="risk-card">
              <div className="risk-status">
                <span></span>
                SYSTEM ACTIVE
              </div>

              <h4>Disaster Monitoring</h4>

              <p>
                AI monitoring and risk analysis enabled
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ================= TECHNOLOGY ================= */}
      <section className="technology-section section-container">

        <div className="section-heading center">

          <div className="section-label">
            <span></span>
            TECHNOLOGY STACK
          </div>

          <h2>
            Built with <span>Modern Technology</span>
          </h2>

          <p>
            A combination of modern web development and machine
            learning technologies powers the platform.
          </p>

        </div>

        <div className="technology-grid">

          {technologies.map((tech, index) => (
            <div className="technology-card" key={index}>

              <div className="tech-icon">
                {tech.icon}
              </div>

              <div>
                <h3>{tech.name}</h3>
                <p>{tech.type}</p>
              </div>

            </div>
          ))}

        </div>

      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="about-cta">

        <div className="cta-content">

          <div className="cta-icon">
            <FaShieldAlt />
          </div>

          <h2>
            Building a More
            <span> Disaster-Ready World</span>
          </h2>

          <p>
            Technology cannot stop natural disasters, but better
            prediction, awareness and preparation can help reduce
            their impact.
          </p>

          <button className="primary-btn">
            <Link to="/dashboard">Explore Dashboard</Link>
          </button>

        </div>

      </section>

    </div>
  );
};

export default About;

