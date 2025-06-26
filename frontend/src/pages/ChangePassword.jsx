import React, { useState } from 'react';
import './ChangePassword.css';
import logo from '../logo.png'; // Update path if needed

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🔒 Simple frontend validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New and confirm passwords do not match.');
      return;
    }

    setError('');

    // ✅ TODO: Send data to backend
    console.log('Submitting:', formData);
    alert('Password change submitted (backend not connected yet)');
  };

  return (
    <div className="password-page">
      <div className="password-left">
        <img src={logo} alt="Calorie Craft Logo" className="password-logo" />
        <h1 className="password-title">Calorie Craft</h1>
      </div>

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
