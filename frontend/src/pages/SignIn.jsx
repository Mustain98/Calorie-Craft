import React, { useState } from 'react';
import './SignIn.css';
import logo from '../cc_logo-removebg-preview.png'; // Adjust path if needed

export default function SigninPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for backend login request
    console.log('Login data:', formData);
    alert('Login submitted (backend not connected)');
  };

  return (
    <div className="signin-page">
      <div className="signin-left">
        <img src={logo} alt="Calorie Craft Logo" className="signin-logo" />
        <h1 className="signin-title">Calorie Craft</h1>
      </div>

      <div className="signin-right">
        <form className="signin-form" onSubmit={handleSubmit}>
          <h2><span className="green-text">Welcome</span> Back!</h2>
          <p className="subtitle">Sign in to get started</p>

          <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} required />

          <button type="submit">Sign in</button>
        </form>
      </div>
    </div>
  );
}
