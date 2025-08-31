import React, { useState,useEffect } from 'react';
import './SignUp.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import './Profile.css';
export default function CreateAdminPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    accessLevel: '',
});

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState({});
  const [sidebarVisible, setSidebarVisible] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/adminsignin');

    axios.get(`${process.env.REACT_APP_API_ADMIN_URL}/api/admin/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setAdminData(res.data))
    .catch(() => {
      localStorage.removeItem('token');
      navigate('/adminsignin');
    });
  }, [navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
  const isStrongPassword = (p) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(p);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isStrongPassword(formData.password)) {
     setError("Password must be ≥6 chars and include lowercase, uppercase, and a number.");
     return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setSuccess('');

try {
  const token = localStorage.getItem('token');
    await axios.post(`${process.env.REACT_APP_API_ADMIN_URL}/api/admin/create`, {
    name: formData.name,
    email: formData.email,
    password: formData.password,
    accessLevel: formData.accessLevel,
  }, 
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

      setSuccess('Admin created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/adminpage');
      }, 1500);
    
      
          } catch (err) {
            setError(err.response?.data?.error || 'Unable to create admin.');
          }
        };
      
        return (
          <div className="signup-page">
            <main className={`profile-main ${sidebarVisible ? '' : 'sidebar-hidden'}`}> 
              <button className="toggle-btn" onClick={toggleSidebar}>&#8942;</button>
              {sidebarVisible && <AdminSidebar visible={sidebarVisible} AdminData={adminData} />}
      
                <div className="signup-right">
                  <form className="signup-form" onSubmit={handleSubmit}>
                      <h2>Create Admin</h2>
      
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
      
                      <label>Access Level</label>
                      <select
                      type="number"
                      name="accessLevel"
                      value={formData.accessLevel}
                      onChange={handleChange}
                      required
                      >
                      <option value="">Select Access Level</option>
                      <option value="1">Moderator</option>
                      <option value="2">Admin</option>
                      </select>
      
      
      
                      {error && <p className="error-text">{error}</p>}
                      {success && <p className="success-text">{success}</p>}
      
                      <button type="submit">Create Admin</button>
                  </form>
                </div>
            </main>
          </div>
        );
      }

      
