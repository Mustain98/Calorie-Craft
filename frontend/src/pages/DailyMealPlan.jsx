import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './DailyMealPlan.css';
import logo from '../logo.png';

export default function DailyMealPlan() {
  const navigate = useNavigate();
  const { day } = useParams();
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleBackToWeekly = () => {
    navigate('/mealplan');
  };

  // Dummy data for daily meal plan
  const dailyMeals = [
    {
      type: 'Breakfast',
      name: 'Chicken Breast',
      weight: '200 gm',
      image: 'https://images.unsplash.com/photo-1532636721503-4ab8c4f98044?w=200&h=150&fit=crop',
      nutrition: {
        calories: { value: 264, percentage: 12 },
        fat: { value: '0g', percentage: 0 },
        carbs: { value: '34g', percentage: 16 },
        fiber: { value: '9g', percentage: 43 },
        sugar: { value: '3g', percentage: 10 },
        protein: { value: '3g', percentage: 14 },
        cholesterol: { value: '10mg', percentage: 20 },
        vitaminA: { value: '932mg', percentage: 26 },
        vitaminC: { value: '13mg', percentage: 14 }
      }
    },
    {
      type: 'Lunch',
      name: 'Chicken Breast',
      weight: '200 gm',
      image: 'https://images.unsplash.com/photo-1532636721503-4ab8c4f98044?w=200&h=150&fit=crop',
      nutrition: {
        calories: { value: 264, percentage: 12 },
        fat: { value: '5g', percentage: 6 },
        carbs: { value: '0g', percentage: 0 },
        fiber: { value: '0g', percentage: 0 },
        sugar: { value: '0g', percentage: 0 },
        protein: { value: '49g', percentage: 98 },
        cholesterol: { value: '15mg', percentage: 25 },
        vitaminA: { value: '0mg', percentage: 0 },
        vitaminC: { value: '0mg', percentage: 0 }
      }
    },
    {
      type: 'Dinner',
      name: 'Grilled Salmon',
      weight: '150 gm',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&h=150&fit=crop',
      nutrition: {
        calories: { value: 231, percentage: 11 },
        fat: { value: '11g', percentage: 14 },
        carbs: { value: '0g', percentage: 0 },
        fiber: { value: '0g', percentage: 0 },
        sugar: { value: '0g', percentage: 0 },
        protein: { value: '31g', percentage: 62 },
        cholesterol: { value: '20mg', percentage: 30 },
        vitaminA: { value: '150mg', percentage: 18 },
        vitaminC: { value: '5mg', percentage: 8 }
      }
    }
  ];

  const [selectedMeal, setSelectedMeal] = useState(dailyMeals[0]);

  const handleMealSelect = (meal) => {
    setSelectedMeal(meal);
  };

  return (
    <div className="daily-meal-plan-page">
      {/* Toggle Sidebar Button */}
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
              src="https://randomuser.me/api/portraits/men/75.jpg"
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
              <button onClick={() => navigate('/mealplan')}>Meal Plan</button>
              <button onClick={() => navigate('/nutrition')}>Nutritional Requirement</button>
              <button onClick={() => navigate('/goal')}>Goal Setting</button>
            </nav>
            <div className="logout-container">
              <button className="logout-btn" onClick={handleLogout}>Log out</button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className={`daily-meal-content ${!sidebarVisible ? 'sidebar-hidden' : ''}`}>
        {/* Header */}
        <div className="daily-meal-header">
          <button className="back-btn" onClick={handleBackToWeekly}>
            ←
          </button>
          <h3>{day} Meal Plan</h3>
        </div>

        <div className="daily-meal-body">
          {/* Left Side - Meals */}
          <div className="meals-section">
            <div className="section-tag meals-tag">
              Meals
            </div>

            <div className="meals-list">
              {dailyMeals.map((meal, index) => (
                <div 
                  key={index} 
                  className={`meal-item ${selectedMeal.type === meal.type ? 'active' : ''}`}
                  onClick={() => handleMealSelect(meal)}
                >
                  <div className="meal-item-header">
                    <h4>{meal.type}</h4>
                    <button className="options-btn">⋮</button>
                  </div>
                  
                  <div className="meal-item-content">
                    <img 
                      src={meal.image}
                      alt={meal.name}
                      className="meal-item-image"
                    />
                    <div className="meal-item-info">
                      <div className="meal-name">{meal.name}</div>
                      <div className="meal-weight">{meal.weight}</div>
                    </div>
                    <button className="options-btn">⋮</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Nutrition */}
          <div className="nutrition-section">
            <div className="section-tag nutrition-tag">
              Nutritions
            </div>

            <div className="nutrition-container">
              {selectedMeal.nutrition && Object.entries(selectedMeal.nutrition).map(([key, value]) => (
                <div key={key} className="nutrition-item">
                  <span className="nutrition-name">{key}</span>
                  <div className="nutrition-details">
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${value.percentage > 50 ? 'high' : value.percentage > 25 ? 'medium' : 'low'}`}
                        style={{ width: `${Math.min(value.percentage, 100)}%` }}
                      />
                    </div>
                    <span className="nutrition-value">{value.value}</span>
                    <span className="nutrition-percentage">{value.percentage}%</span>
                  </div>
                </div>
              ))}

              <button className="more-btn">
                More
              </button>
            </div>
          </div>
        </div>

        {/* Action Menu */}
        <div className="action-menu">
          <div className="action-text">meal click optio...</div>
          <div className="action-options">
            <div className="action-option">remove</div>
            <div className="action-option">Edit</div>
            <div className="action-option">options</div>
          </div>
        </div>
      </main>
    </div>
  );
}