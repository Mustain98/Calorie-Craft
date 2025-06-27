import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MealPlan.css';
import logo from '../logo.png';

export default function MealPlan() {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleMealClick = (meal, dayName) => {
    setSelectedMeal({ ...meal, day: dayName });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMeal(null);
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const nutritionSummary = {
    calories: 1554,
    fat: '51g',
    carbs: '123g',
    fiber: '21g',
    sugar: '37g',
    protein: '72g',
  };

  const mealsByDay = weekDays.map((day) => ({
    day,
    meals: [
      { 
        label: 'Breakfast', 
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
        label: 'Snack - 1', 
        name: 'Peanut Butter Bites', 
        weight: '50 gm',
        image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=200&h=150&fit=crop',
        nutrition: {
          calories: { value: 180, percentage: 8 },
          fat: { value: '12g', percentage: 15 },
          carbs: { value: '8g', percentage: 4 },
          fiber: { value: '3g', percentage: 12 },
          sugar: { value: '5g', percentage: 8 },
          protein: { value: '8g', percentage: 16 }
        }
      },
      { 
        label: 'Lunch', 
        name: 'Chicken Breast', 
        weight: '200 gm',
        image: 'https://images.unsplash.com/photo-1532636721503-4ab8c4f98044?w=200&h=150&fit=crop',
        nutrition: {
          calories: { value: 264, percentage: 12 },
          fat: { value: '5g', percentage: 6 },
          carbs: { value: '0g', percentage: 0 },
          fiber: { value: '0g', percentage: 0 },
          sugar: { value: '0g', percentage: 0 },
          protein: { value: '49g', percentage: 98 }
        }
      },
      { 
        label: 'Snack - 2', 
        name: 'Crackers & Hummus', 
        weight: '75 gm',
        image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=200&h=150&fit=crop',
        nutrition: {
          calories: { value: 150, percentage: 7 },
          fat: { value: '6g', percentage: 8 },
          carbs: { value: '20g', percentage: 9 },
          fiber: { value: '4g', percentage: 16 },
          sugar: { value: '2g', percentage: 3 },
          protein: { value: '5g', percentage: 10 }
        }
      },
      { 
        label: 'Dinner', 
        name: 'Grilled Salmon', 
        weight: '150 gm',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&h=150&fit=crop',
        nutrition: {
          calories: { value: 231, percentage: 11 },
          fat: { value: '11g', percentage: 14 },
          carbs: { value: '0g', percentage: 0 },
          fiber: { value: '0g', percentage: 0 },
          sugar: { value: '0g', percentage: 0 },
          protein: { value: '31g', percentage: 62 }
        }
      },
      { 
        label: 'Snack - 3', 
        name: 'Fruit Bowl', 
        weight: '100 gm',
        image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=200&h=150&fit=crop',
        nutrition: {
          calories: { value: 89, percentage: 4 },
          fat: { value: '0g', percentage: 0 },
          carbs: { value: '23g', percentage: 11 },
          fiber: { value: '3g', percentage: 12 },
          sugar: { value: '18g', percentage: 25 },
          protein: { value: '1g', percentage: 2 }
        }
      },
    ],
  }));

  return (
    <div className="meal-plan-page">
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

      {/* Main Content */}
      <main className={`meal-plan-content ${!sidebarVisible ? 'sidebar-hidden' : ''}`}>
        {/* Nutrition Summary */}
        <div className="nutrition-summary-row">
          {weekDays.map((_, i) => (
            <div key={i} className="nutrition-col">
              <strong>Calories</strong> {nutritionSummary.calories} <br />
              <span className="dot red" /> {nutritionSummary.fat} fat<br />
              <span className="dot orange" /> {nutritionSummary.carbs} carbs<br />
              <span className="dot green" /> {nutritionSummary.fiber} fiber<br />
              <span className="dot blue" /> {nutritionSummary.sugar} sugar<br />
              <span className="dot purple" /> {nutritionSummary.protein} protein
            </div>
          ))}
        </div>

        {/* Meal Grid */}
        <div className="meal-grid">
          {mealsByDay.map((dayBlock, i) => (
            <div key={i} className="day-column">
              <h4>{dayBlock.day}</h4>
              {dayBlock.meals.map((meal, idx) => (
                <div 
                  key={idx} 
                  className="meal-card clickable"
                  onClick={() => handleMealClick(meal, dayBlock.day)}
                >
                  <img src={meal.image} alt={meal.name} />
                  <div>
                    <small>{meal.label}</small>
                    <p>{meal.name}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>

      {/* Modal */}
      {showModal && selectedMeal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-header">
              <button className="back-btn" onClick={closeModal}>
                ←
              </button>
              <h3>{selectedMeal.day} Meal Plan</h3>
            </div>

            <div className="modal-body">
              {/* Left Side - Meals */}
              <div className="modal-left">
                <div className="section-tag meals-tag">
                  Meals
                </div>

                <div className="meals-container">
                  <div className="meal-detail-card">
                    <div className="meal-detail-header">
                      <h4>{selectedMeal.label}</h4>
                      <button className="options-btn">⋮</button>
                    </div>
                    
                    <div className="meal-detail-content">
                      <img 
                        src={selectedMeal.image}
                        alt={selectedMeal.name}
                        className="meal-detail-image"
                      />
                      <div className="meal-detail-info">
                        <div className="meal-name">{selectedMeal.name}</div>
                        <div className="meal-weight">{selectedMeal.weight}</div>
                      </div>
                      <button className="options-btn">⋮</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Nutrition */}
              <div className="modal-right">
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

            {/* Action Buttons */}
            <div className="action-buttons">
              <div className="action-menu">
                <div className="action-text">meal click optio...</div>
                <div className="action-options">
                  <div className="action-option">remove</div>
                  <div className="action-option">Edit</div>
                  <div className="action-option">options</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}