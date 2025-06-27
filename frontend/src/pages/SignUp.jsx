import React, { useState } from 'react';
import './SignUp.css';
import logo from '../logo.png'; // Update path if necessary

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    sex: '',
    age: '',
    weight: '',
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

          <label>Username</label>
          <input
            type="text"
            name="username"
            placeholder="Enter your username"
            value={formData.username}
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
            name="sex"
            value={formData.sex}
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

          <button type="submit">Sign up</button>
        </form>
      </div>
    </div>
  );
}
