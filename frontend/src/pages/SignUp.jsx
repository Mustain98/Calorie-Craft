import React, { useState } from 'react';
import './SignUp.css';
import logo from '../cc_logo-removebg-preview.png'; // Adjust path if needed

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    sex: '',
    age: '',
    weight: '',
    bodyfat: '',
    activityLevel: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    console.log('Signup form data:', formData);
    alert('Sign-up submitted (backend not connected)');
  };

  return (
    <div className="signup-page">
      <div className="signup-left">
        <img src={logo} alt="Calorie Craft Logo" className="signup-logo" />
        <h1 className="signup-title">Calorie Craft</h1>
      </div>

      <div className="signup-right">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2>Sign up to get started</h2>

          <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} required />
          <input type="password" name="confirmPassword" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} required />
          <input type="text" name="sex" placeholder="Enter your sex" value={formData.sex} onChange={handleChange} required />
          <input type="number" name="age" placeholder="Enter your age" value={formData.age} onChange={handleChange} required />
          <input type="number" name="weight" placeholder="Enter your weight" value={formData.weight} onChange={handleChange} required />

          {/* Dropdown for Bodyfat */}
          <select name="bodyfat" value={formData.bodyfat} onChange={handleChange} required>
            <option value="">Select bodyfat % range</option>
            <option value="10-15%">10–15%</option>
            <option value="15-20%">15–20%</option>
            <option value="20-25%">20–25%</option>
            <option value="25-30%">25–30%</option>
            <option value="30%+">30%+</option>
          </select>

          {/* Dropdown for Activity Level */}
          <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} required>
            <option value="">Select activity level</option>
            <option value="sedentary">Sedentary</option>
            <option value="light">Lightly active</option>
            <option value="moderate">Moderately active</option>
            <option value="active">Active</option>
            <option value="very active">Very active</option>
          </select>

          {error && <p className="error-text">{error}</p>}

          <button type="submit">Sign up</button>
        </form>
      </div>
    </div>
  );
}
