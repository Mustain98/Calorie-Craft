import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import logo from "../logo.png"; // Adjust if your logo path differs

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <img src={logo} alt="Calorie Craft Logo" className="landing-logo" />
      <h1 className="landing-title">Calorie Craft</h1>
      <div className="landing-buttons">
        <button className="landing-button" onClick={() => navigate("/signUp")}>
          Sign Up
        </button>
        <button className="landing-button" onClick={() => navigate("/signin")}>
          Sign In
        </button>
      </div>
    </div>
  );
}
