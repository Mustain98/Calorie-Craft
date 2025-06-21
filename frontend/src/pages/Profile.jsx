import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import logo from '../logo.png'; // Your logo

export default function ProfilePage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const handleChangePassword = () => {
    navigate('/changepassword');
  };

  return (
    <div className="profile-page">
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
          <h4>Hello! Michael</h4>
          <p>michaelcraft67@gmail.com</p>
        </div>
        <nav className="sidebar-menu">
          <button className="active">Your Profile</button>
          <button>Recipes</button>
          <button>Plans</button>
          <button>Progress</button>
          <button>Set Goal</button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          Log out
        </button>
      </aside>

      <main className="profile-form-container">
        <form className="profile-form">
          <div className="form-header">
            <h2>Your Profile</h2>
            <button type="button" className="update-btn">Update Profile</button>
          </div>

          <input type="email" placeholder="Email address" value="email@gmail.com" readOnly />
          <input type="text" placeholder="Sex" value="Male" readOnly />
          <input type="number" placeholder="Age" value="50" readOnly />
          <input type="number" placeholder="Weight" value="70" readOnly />
          <input type="number" placeholder="BodyFat" value="20" readOnly />
          <input type="text" placeholder="ActivityLevel" value="Moderate" readOnly />

          <button
            type="button"
            className="change-password-btn"
            onClick={handleChangePassword}
          >
            Change Password
          </button>
        </form>
      </main>
    </div>
  );
}
