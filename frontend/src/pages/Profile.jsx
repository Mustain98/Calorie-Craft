import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import Navbar from './Navbar';
import axios from 'axios';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [userData, setUserData] = useState(null);

  // Check token and load user info on mount
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/signin');
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserData(res.data);
      } catch (err) {
        // Token invalid or expired
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/signin');
      }
    };

    fetchUser();
  }, [navigate]);

  const handleChangePassword = () => {
    navigate('/changepassword');
  };

  if (!userData) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="profile-page">
      <Navbar 
        sidebarVisible={sidebarVisible}
        setSidebarVisible={setSidebarVisible}
        userData={userData}
        activePage="profile"
      />

      {/* Main content */}
      <main className={`profile-main ${sidebarVisible ? '' : 'sidebar-hidden'}`}>
        <div className="profile-form-container">
          <form className="profile-form">
            <div className="form-header">
              <h2>Your Profile</h2>
              <button type="button" className="update-btn">Update Profile</button>
            </div>

            <label>Email address</label>
            <input type="email" value={userData.email} readOnly />

            <label>Sex</label>
            <input type="text" value={userData.gender || ''} readOnly />

            <label>Age</label>
            <input type="number" value={userData.age || ''} readOnly />

            <label>Weight (kg)</label>
            <input type="number" value={userData.weight || ''} readOnly />

            <label>Body Fat (%)</label>
            <input type="number" value={userData.bodyFat || ''} readOnly />

            <label>Activity Level</label>
            <input type="text" value={userData.activityLevel || ''} readOnly />

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