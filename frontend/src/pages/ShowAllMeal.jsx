import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ShowAllMeal.css';
import logo from '../logo.png';

export default function ShowAllMeal() {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my'

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  // Sample meal data
  const allMeals = [
    { id: 1, name: 'Grilled Chicken Salad', calories: 300, protein: 25 },
    { id: 2, name: 'Oatmeal with Fruits', calories: 250, fiber: 8 },
    { id: 3, name: 'Boiled Egg & Toast', calories: 200, protein: 12 },
  ];

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
      <main className={`show-meal-content ${sidebarVisible ? '' : 'sidebar-hidden'}`}>
        {/* Background Card - Visible in both views */}
        <div className="background-card"></div>

        {/* Content Container */}
        <div className="content-container">
          {/* Top Controls */}
          <div className="top-controls">
            <div className="meal-toggle">
              <button 
                className={activeTab === 'my' ? 'active' : 'inactive'}
                onClick={() => setActiveTab('my')}
              >
                My Food
              </button>
              <button 
                className={activeTab === 'all' ? 'active' : 'inactive'}
                onClick={() => setActiveTab('all')}
              >
                All Meals
              </button>
            </div>

            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search Foods..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Meal List - Only shown in All Meals view */}
          {activeTab === 'all' && (
            <div className="meal-list">
              {allMeals.map(meal => (
                <div key={meal.id} className="meal-card">
                  <h3>{meal.name}</h3>
                  <p>Calories: {meal.calories} kcal</p>
                  {meal.protein && <p>Protein: {meal.protein}g</p>}
                  {meal.fiber && <p>Fiber: {meal.fiber}g</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}