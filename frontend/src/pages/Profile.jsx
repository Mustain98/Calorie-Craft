import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import Sidebar from '../components/sideBar';
import axios from 'axios';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/signin');

    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data);
        setFormData(res.data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        localStorage.removeItem('token');
        navigate('/signin');
      }
    };

    fetchUser();
  }, [navigate]);

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
  const handleChangePassword = () => navigate('/changepassword');

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:4000/api/users/me', {
        email: formData.email,
        age: formData.age,
        gender: formData.gender,
        weight: formData.weight,
        height: formData.bodyfat,
        activityLevel: formData.activityLevel
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Profile updated successfully');
    } catch (err) {
      alert('Failed to update profile');
    }
    setIsSubmitting(false);
  };

  if (!userData) return <p>Loading profile...</p>;

  return (
    <div className="profile-page">
      <button className="toggle-btn" onClick={toggleSidebar}>&#8942;</button>

      {userData && (
        <Sidebar
          visible={sidebarVisible}
          userData={userData}
        />
      )}

      <main className={`profile-main ${sidebarVisible ? '' : 'sidebar-hidden'}`}>
        <div className="profile-form-container">
          <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-header">
              <h2>Your Profile</h2>
              <button
                type="button"
                className="update-btn"
                onClick={handleUpdateProfile}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Profile'}
              </button>
            </div>

            <label>Email address</label>
            <input type="text" name="email" value={formData.email || ''} onChange={handleChange} />

            <label>Sex</label>
            <input type="text" name="gender" value={formData.gender || ''} onChange={handleChange} />

            <label>Age</label>
            <input type="text" name="age" value={formData.age || ''} onChange={handleChange} />

            <label>Weight (kg)</label>
            <input type="text" name="weight" value={formData.weight || ''} onChange={handleChange} />

            <label>Body Fat (%)</label>
            <input type="text" name="bodyfat" value={formData.bodyfat || ''} onChange={handleChange} />

            <label>Activity Level</label>
            <input type="text" name="activityLevel" value={formData.activityLevel || ''} onChange={handleChange} />

            <button
              type="button"
              className="change-password-btn"
              onClick={handleChangePassword}
            >
              Change Password
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}