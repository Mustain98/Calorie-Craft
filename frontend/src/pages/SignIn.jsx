import React, { useState } from "react";
import "./SignIn.css";
import LeftSection from "../components/LeftSection";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function SigninPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true); // start loading
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/login`,
        formData
      );

      // Store token & user data in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      toast.success("Login successful!");
      setError("");
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
      toast.error(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false); // stop loading
    }
  };

  const handleNavigateToSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="signin-page">
      <LeftSection />

      <div className="signin-right">
        <form className="signin-form" onSubmit={handleSubmit}>
          <h2>
            <span className="green-text">Welcome</span> Back!
          </h2>
          <p className="subtitle">Sign in to get started</p>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="signup-link">
            Don't have an account?{" "}
            <span className="link-text" onClick={handleNavigateToSignup}>
              Sign up here
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
