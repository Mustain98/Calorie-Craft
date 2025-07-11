
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import logo from '../logo.png';
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  const handleChangePassword = () => {
    navigate('/changepassword');
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  if (!userData) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="profile-page">
      {/* Toggle Button */}
      <button className="toggle-btn" onClick={toggleSidebar}>
        &#8942;
      </button>

      {/* Sidebar */}
      {sidebarVisible && (
        <aside className="sidebar">
          <div className="sidebar-header">
            <img src={logo} alt="Calorie Craft" className="sidebar-logo" />
            <h2>Calorie Craft</h2>
          </div>

          <div className="sidebar-user">
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="User"
              className="user-avatar"
            />
            <h4>Hello! {userData.name}</h4>
            <p>{userData.email}</p>
          </div>

          <div className="sidebar-content">
            <nav className="sidebar-menu">
              <button className="active" onClick={() => navigate('/profile')}>Profile</button>
              <button onClick={() => navigate('/showmeal')}>Show All Meal</button>
              <button onClick={() => navigate('/mealplan')}>Meal Plan</button>
              <button onClick={() => navigate('/nutrition')}>Nutritional Requirement</button>
              <button onClick={() => navigate('/goal')}>Goal Setting</button>
            </nav>

            <div className="logout-container">
              <button className="logout-btn" onClick={handleLogout}>
                Log out
              </button>
            </div>
          </div>
        </aside>
      )}

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
