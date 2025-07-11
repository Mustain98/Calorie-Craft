// src/components/Sidebar.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../logo.png';
import './sideBar.css';

export default function Sidebar({
  visible,
  onLogout,
  userData = {},      // default so we never read name/email from null
}) {
  const navigate = useNavigate();
  if (!visible) return null;

  const { name = 'Guest', email = '', avatar } = userData;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="Calorie Craft" className="sidebar-logo" />
        <h2>Calorie Craft</h2>
      </div>

      <div className="sidebar-user">
        <img
          src={avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}
          alt={name}
          className="user-avatar"
        />
        <h4>Hello, {name}</h4>
        <p>{email}</p>
      </div>

      <nav className="sidebar-menu">
        <button onClick={() => navigate('/profile')}>Profile</button>
        <button onClick={() => navigate('/showmeal')}>Show All Meal</button>
        <button onClick={() => navigate('/mealplan')}>Meal Plan</button>
        <button onClick={() => navigate('/nutrition')}>Nutritional Requirement</button>
        <button onClick={() => navigate('/goal')}>Goal Setting</button>
      </nav>

      <div className="logout-container">
        <button className="logout-btn" onClick={onLogout}>
          Log out
        </button>
      </div>
    </aside>
  );
}
