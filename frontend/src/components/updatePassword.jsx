import React, { useState } from "react";
import axios from "axios";

/**
 * Reusable password update form
 * Props:
 *  - endpoint (string): full URL to PUT (expects { currentPassword, newPassword })
 *  - onSuccess (fn): called after success
 *  - tokenKey (string): localStorage key for auth token (default: "token")
 *  - title (string): heading text (default: "Change Password")
 *  - passwordRegex (regex): regex pattern for password validation
 *  - message (string): password validation message
 */
export default function UpdatePasswordComponent({
  endpoint,
  onSuccess,
  tokenKey = "token",
  title = "Change Password",
  passwordRegex,
  message,
}) {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const handleChange = (e) => {
    setError("");
    setOk("");
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New and confirm passwords do not match.");
      return;
    }

    if (!passwordRegex.test(formData.newPassword)) {
      setError(message);
      return;
    }

    const token = localStorage.getItem(tokenKey);
    if (!token) {
      setError("You are not logged in.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.put(
        endpoint,
        {
          currentPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOk(res.data?.message || "Password updated successfully!");
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      if (typeof onSuccess === "function") onSuccess();
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to update password";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="password-form" onSubmit={handleSubmit}>
      <h2>{title}</h2>

      <input
        type="password"
        name="oldPassword"
        placeholder="Current Password"
        value={formData.oldPassword}
        onChange={handleChange}
        required
        disabled={submitting}
      />

      <input
        type="password"
        name="newPassword"
        placeholder="New Password"
        value={formData.newPassword}
        onChange={handleChange}
        required
        disabled={submitting}
      />

      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm New Password"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        disabled={submitting}
      />

      {error && <p className="error-text">{error}</p>}
      {ok && <p className="ok-text">{ok}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? "Updating..." : "Change Password"}
      </button>

      <p className="hint-text">{message}</p>
    </form>
  );
}
