import React, { useState } from 'react';
import './SignIn.css';
import LeftSection from '../components/LeftSection';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


export default function AdminSigninPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  
  

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Please enter email and password.');
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_ADMIN_URL}/api/admin/login`, formData);

      // Store token & user data in localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));

      setError('');
      navigate('/adminpage');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="signin-page">

      <LeftSection />
      
      <div className="signin-right">
        <form className="signin-form" onSubmit={handleSubmit}>
          <h2><span className="green-text">Welcome</span> Back!</h2>
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
          <button type="submit">Sign in</button>
        </form>
      </div>
    </div>
  );
}