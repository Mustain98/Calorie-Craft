// src/pages/ShowAllMeal.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ShowAllMeal.css';
import Sidebar from './sideBar';

export default function ShowAllMeal() {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my'
  const [allMeals, setAllMeals] = useState([]);
  const [userData, setUserData] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showNutritionModal, setShowNutritionModal] = useState(false);

  useEffect(() => {
    // 1) Fetch all system meals
    axios
      .get('http://localhost:4000/api/meal')
      .then(res => setAllMeals(res.data))
      .catch(err => console.error('Failed to load meals:', err));

    // 2) Fetch current user for the sidebar
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    axios
      .get('http://localhost:4000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setUserData(res.data))
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/signin');
      });
  }, [navigate]);

  const toggleSidebar = () => setSidebarVisible(v => !v);
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  // "My Food" tab is empty until you wire up user-specific meals
  const userMeals = [];
  const filteredMeals = activeTab === 'my' ? userMeals : allMeals;

  const handleMealClick = meal => {
    if (activeTab === 'all') {
      setSelectedMeal(meal);
      setShowNutritionModal(true);
    }
  };
  const closeNutritionModal = () => {
    setShowNutritionModal(false);
    setSelectedMeal(null);
  };
  const handleSaveMeal = () => {
    // TODO: POST to backend to save meal under the user
    console.log('Saving meal:', selectedMeal);
    closeNutritionModal();
  };

  return (
    <div className="show-meal-page">
      {/* Toggle Sidebar Button */}
      <button className="toggle-btn" onClick={toggleSidebar}>
        &#8942;
      </button>

    {userData && (
    <Sidebar
    userData={userData}
    onLogout={handleLogout}       // was handleLogout
    visible={sidebarVisible}      // was sidebarVisible
    />
    )}

      {/* Main Content */}
      <main className={`show-meal-content ${!sidebarVisible ? 'sidebar-hidden' : ''}`}>
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
        </div>

        <div className="meal-container">
          <div className="meal-list-card">
            <div className="meal-list">
              {filteredMeals.length === 0 ? (
                <div className="empty-state">
                  {activeTab === 'my' ? 'No saved meals yet' : 'No meals available'}
                </div>
              ) : (
                filteredMeals.map(meal => (
                  <div
                    key={meal._id}
                    className={`meal-card ${activeTab === 'all' ? 'clickable' : ''}`}
                    onClick={() => handleMealClick(meal)}
                  >
                    <img src={meal.imageUrl || meal.image} alt={meal.name} />
                    <div className="meal-card-content">
                      <h3>{meal.name}</h3>
                      <p className="calories">Calories: {meal.totalCalories}</p>
                      <div className="meal-macros">
                        <span>Protein: {meal.totalProtein}g</span>
                        <span>Carbs: {meal.totalCarbs}g</span>
                        <span>Fat: {meal.totalFat}g</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Nutrition Modal */}
      {showNutritionModal && selectedMeal && (
        <div className="modal-overlay" onClick={closeNutritionModal}>
          <div className="nutrition-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeNutritionModal}>
              &times;
            </button>

            <div className="modal-header">
              <img
                src={selectedMeal.imageUrl || selectedMeal.image}
                alt={selectedMeal.name}
                className="modal-image"
              />
              <h2 className="modal-title">{selectedMeal.name}</h2>
            </div>

            <div className="modal-content">
              <div className="ingredients-section">
                <h3>Ingredients</h3>
                <div className="ingredients-list">
                  {selectedMeal.foodItems?.length
                    ? selectedMeal.foodItems.map((item, idx) => (
                        <div key={idx} className="ingredient-item">
                          <img
                            src={`https://source.unsplash.com/60x60/?${item.food.name}`}
                            alt={item.food.name}
                            className="ingredient-image"
                          />
                          <span>
                            {item.quantity}× {item.food.name}
                          </span>
                        </div>
                      ))
                    : selectedMeal.ingredients?.map((ing, i) => (
                        <div key={i} className="ingredient-item">
                          <img
                            src={`https://source.unsplash.com/60x60/?${ing.toLowerCase()}`}
                            alt={ing}
                            className="ingredient-image"
                          />
                          <span>{ing}</span>
                        </div>
                      ))}
                </div>
              </div>

              <div className="nutrition-section">
                <h3>Nutritions</h3>
                <div className="nutrition-grid">
                  <div className="nutrition-item">
                    <span className="nutrition-label">Calories</span>
                    <span className="nutrition-value">{selectedMeal.totalCalories}</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="nutrition-label">Protein</span>
                    <span className="nutrition-value">{selectedMeal.totalProtein}</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="nutrition-label">Carbohydrate</span>
                    <span className="nutrition-value">{selectedMeal.totalCarbs}</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="nutrition-label">Fat</span>
                    <span className="nutrition-value">{selectedMeal.totalFat}</span>
                  </div>
                </div>
              </div>
            </div>

            <button className="save-changes-btn" onClick={handleSaveMeal}>
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
