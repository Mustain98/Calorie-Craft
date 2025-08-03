import React, { useState } from "react";
import "./SignUp.css";
import LeftSection from "../components/LeftSection";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    age: "",
    weight: "",
    height: "",
    activityLevel: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "http://localhost:4000/api/users/register",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          age: Number(formData.age),
          gender: formData.gender,
          weight: Number(formData.weight),
          height: Number(formData.height),
          activityLevel: formData.activityLevel,
        }
      );

      localStorage.setItem("token", response.data.token);

      setSuccess("User registered successfully! Redirecting to login...");
      toast.success("Registration Successful");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
      toast.error("Registration failed.");
    }
  };

  return (
    <div className="signup-page">
      <LeftSection />

      <div className="signup-right">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2>Sign up to get started</h2>

          <label>Username</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <label>Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <label>Age</label>
          <input
            type="number"
            name="age"
            placeholder="Enter your age"
            value={formData.age}
            onChange={handleChange}
            required
          />

          <label>Weight (kg)</label>
          <input
            type="number"
            name="weight"
            placeholder="Enter your weight"
            value={formData.weight}
            onChange={handleChange}
            required
          />

          <label>Height (cm)</label>
          <input
            type="number"
            name="height"
            placeholder="Enter your height"
            value={formData.height}
            onChange={handleChange}
            required
          />

          <label>Activity Level</label>
          <select
            name="activityLevel"
            value={formData.activityLevel}
            onChange={handleChange}
            required
          >
            <option value="">Select activity level</option>
            <option value="sedentary">Sedentary</option>
            <option value="light">Lightly active</option>
            <option value="moderate">Moderately active</option>
            <option value="active">Active</option>
            <option value="very active">Very active</option>
          </select>

          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}

          <button type="submit">Sign up</button>
        </form>
      </div>
    </div>
  );
}
