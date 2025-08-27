import React, { useState } from "react";
import "./ChangePassword.css";
import LeftSection from "../components/LeftSection";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New and confirm passwords do not match.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not logged in.");
        navigate("/signin");
        return;
      }

      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/me/password`,
        {
          currentPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(response.data.message || "Password updated successfully!");
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setError("");
      navigate("/signin");
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to update password";
      setError(msg);
    }
  };

  return (
    <div className="password-page">
      <LeftSection />

      <div className="password-right">
        <form className="password-form" onSubmit={handleSubmit}>
          <h2>Change Password</h2>

          <input
            type="password"
            name="oldPassword"
            placeholder="Old Password"
            value={formData.oldPassword}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit">Change Password</button>
        </form>
      </div>
    </div>
  );
}
