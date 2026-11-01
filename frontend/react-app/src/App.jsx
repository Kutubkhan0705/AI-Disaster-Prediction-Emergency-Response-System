import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import NavBar from "./components/NavBar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import FloodPrediction from "./pages/FloodPrediction.jsx";
import EarthquakePrediction from "./pages/EarthquakePrediction.jsx";
import CyclonePrediction from "./pages/CyclonePrediction.jsx";
import MapView from "./pages/MapView.jsx";
import Alerts from "./pages/Alerts.jsx";

import { useAuth } from "./hooks/useAuth.js";
import About from "./components/About.jsx";
import ChatBot from "./components/ChatBot.jsx";

export default function App() {
  const { user, loginUser, registerUser, logout } = useAuth();

  return (
    <div className="d-flex flex-column min-vh-100">
      <NavBar user={user} onLogout={logout} />

      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login onLogin={loginUser} />} />
          <Route path="/register" element={<Register onRegister={registerUser} />} />
          <Route path ="/about" element={<About />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route
            path="/flood"
            element={
              <ProtectedRoute user={user}>
                <FloodPrediction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/earthquake"
            element={
              <ProtectedRoute user={user}>
                <EarthquakePrediction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cyclone"
            element={
              <ProtectedRoute user={user}>
                <CyclonePrediction />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
      <ChatBot />
    </div>
  );
}
