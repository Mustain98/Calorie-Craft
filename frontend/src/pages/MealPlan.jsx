import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MealPlan.css';
import logo from '../logo.png';

export default function MealPlan() {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [view, setView] = useState('weekly');

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="meal-plan-page">
      <button className="toggle-btn" onClick={toggleSidebar}>
        <span className="menu-icon">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

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
              <button onClick={() => navigate('/showmeal')}>Show All Meal</button>
              <button className="active">Meal Plan</button>
              <button onClick={() => navigate('/nutrition')}>Nutritional Requirement</button>
              <button onClick={() => navigate('/goal')}>Goal Setting</button>
            </nav>
            <div className="logout-container">
              <button className="logout-btn" onClick={handleLogout}>Log out</button>
            </div>
          </div>
        </aside>
      )}

      <main className={`meal-plan-content ${sidebarVisible ? '' : 'sidebar-hidden'}`}>
        <div className="top-toggle-buttons">
          <button
            className={view === 'daily' ? 'inactive' : 'active'}
            onClick={() => setView('weekly')}
          >
            Weekly
          </button>
          <button
            className={view === 'daily' ? 'active' : 'inactive'}
            onClick={() => setView('daily')}
          >
            Daily
          </button>
        </div>

        {view === 'weekly' ? (
          <div className="weekly-plan">
            <div className="legend-bar">
              {['Calories', 'Fat', 'Carbs', 'Fiber', 'Sugar', 'Protein'].map((nutrient, idx) => (
                <span key={idx} className={`legend-item color-${idx}`}>{nutrient}</span>
              ))}
            </div>
            <div className="day-row">
              <div className="day-column">
                <h4>Monday</h4>
                <div className="meal-card">
                  <div className="meal-card-content">
                    <img src="https://via.placeholder.com/60" alt="Meal" />
                    <div>
                      <strong>Chicken Breast</strong><br />
                      200 gm
                    </div>
                  </div>
                  <div className="meal-actions">
                    <button>Edit</button>
                    <button>Remove</button>
                    <button>Options</button>
                  </div>
                </div>
              </div>
              <div className="day-column">
                <h4>Tuesday</h4>
                <div className="meal-card">
                  <div className="meal-card-content">
                    <img src="https://via.placeholder.com/60" alt="Meal" />
                    <div>
                      <strong>Turkey Sandwich</strong><br />
                      150 gm
                    </div>
                  </div>
                  <div className="meal-actions">
                    <button>Edit</button>
                    <button>Remove</button>
                    <button>Options</button>
                  </div>
                </div>
              </div>
              <div className="day-column">
                <h4>Wednesday</h4>
                <div className="meal-card">
                  <div className="meal-card-content">
                    <img src="https://via.placeholder.com/60" alt="Meal" />
                    <div>
                      <strong>Salmon Fillet</strong><br />
                      180 gm
                    </div>
                  </div>
                  <div className="meal-actions">
                    <button>Edit</button>
                    <button>Remove</button>
                    <button>Options</button>
                  </div>
                </div>
              </div>
              <div className="day-column">
                <h4>Thursday</h4>
                <div className="meal-card">
                  <div className="meal-card-content">
                    <img src="https://via.placeholder.com/60" alt="Meal" />
                    <div>
                      <strong>Vegetable Stir Fry</strong><br />
                      250 gm
                    </div>
                  </div>
                  <div className="meal-actions">
                    <button>Edit</button>
                    <button>Remove</button>
                    <button>Options</button>
                  </div>
                </div>
              </div>
              <div className="day-column">
                <h4>Friday</h4>
                <div className="meal-card">
                  <div className="meal-card-content">
                    <img src="https://via.placeholder.com/60" alt="Meal" />
                    <div>
                      <strong>Beef Steak</strong><br />
                      220 gm
                    </div>
                  </div>
                  <div className="meal-actions">
                    <button>Edit</button>
                    <button>Remove</button>
                    <button>Options</button>
                  </div>
                </div>
              </div>
              <div className="day-column">
                <h4>Saturday</h4>
                <div className="meal-card">
                  <div className="meal-card-content">
                    <img src="https://via.placeholder.com/60" alt="Meal" />
                    <div>
                      <strong>Pasta Primavera</strong><br />
                      300 gm
                    </div>
                  </div>
                  <div className="meal-actions">
                    <button>Edit</button>
                    <button>Remove</button>
                    <button>Options</button>
                  </div>
                </div>
              </div>
              <div className="day-column">
                <h4>Sunday</h4>
                <div className="meal-card">
                  <div className="meal-card-content">
                    <img src="https://via.placeholder.com/60" alt="Meal" />
                    <div>
                      <strong>Grilled Shrimp</strong><br />
                      170 gm
                    </div>
                  </div>
                  <div className="meal-actions">
                    <button>Edit</button>
                    <button>Remove</button>
                    <button>Options</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="daily-container">
            <div className="daily-plan">
              <div className="meal-section">
                <h3>Breakfast</h3>
                <div className="meal-card">
                  <div className="meal-card-content">
                    <img src="https://via.placeholder.com/60" alt="Meal" />
                    <div>
                      <strong>Chicken Breast</strong><br />
                      200 gm
                    </div>
                  </div>
                  <div className="meal-actions">
                    <button>Edit</button>
                    <button>Remove</button>
                    <button>Options</button>
                  </div>
                </div>
              </div>
              <div className="meal-section">
                <h3>Lunch</h3>
                <div className="meal-card">
                  <div className="meal-card-content">
                    <img src="https://via.placeholder.com/60" alt="Meal" />
                    <div>
                      <strong>Chicken Breast</strong><br />
                      200 gm
                    </div>
                  </div>
                  <div className="meal-actions">
                    <button>Edit</button>
                    <button>Remove</button>
                    <button>Options</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="nutrition-panel">
              <h3>Nutritions</h3>
              <ul>
                <li>Calories <span>248</span></li>
                <li>Fat <span>6g</span></li>
                <li>Carbs <span>48g</span></li>
                <li>Fiber <span>12g</span></li>
                <li>Sugar <span>14g</span></li>
                <li>Protein <span>7g</span></li>
                <li>Cholesterol <span>10mg</span></li>
                <li>Vitamin A <span>9357 IU</span></li>
                <li>Vitamin C <span>13mg</span></li>
              </ul>
              <button className="more-btn">More</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}