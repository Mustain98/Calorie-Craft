import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ShowAllMeal.css';
import logo from '../logo.png';

export default function ShowAllMeal() {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="show-meal-page">
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
            <h4>Hello! Michael</h4>
            <p>michaelcraft67@gmail.com</p>
          </div>

          <div className="sidebar-content">
            <nav className="sidebar-menu">
              <button onClick={() => navigate('/profile')}>Profile</button>
              <button className="active">Show All Meal</button>
              <button onClick={() => navigate('/mealplan')}>Meal Plan</button>
              <button onClick={() => navigate('/customizeplan')}>Customize Plan</button>
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

      {/* Main Content */}
      <main
        className={`show-meal-content ${sidebarVisible ? '' : 'sidebar-hidden'}`}
      >

              {/* Top Controls */}
      <div className="top-controls">
        <div className="meal-toggle">
          <button className="inactive">My Food</button>
          <button className="active">All Meals</button>
        </div>

        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search Foods..."
            className="search-input"
            disabled // We'll enable it later when search logic is added
          />
        </div>
      </div>

<div className="meal-list">
  <div className="meal-card">
    <h3>Grilled Chicken Salad</h3>
    <p>Calories: 300 kcal</p>
    <p>Protein: 25g</p>
  </div>
  <div className="meal-card">
    <h3>Oatmeal with Fruits</h3>
    <p>Calories: 250 kcal</p>
    <p>Fiber: 8g</p>
  </div>
  <div className="meal-card">
    <h3>Boiled Egg & Toast</h3>
    <p>Calories: 200 kcal</p>
    <p>Protein: 12g</p>
  </div>
</div>


      </main>
    </div>
  );
}