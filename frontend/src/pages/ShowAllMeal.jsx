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
  const [userMeals, setUserMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showNutritionModal, setShowNutritionModal] = useState(false);

  useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/signin');
    return;
  }
  axios
    .get('http://localhost:4000/api/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => setUserData(res.data))
    .catch(() => {
      localStorage.removeItem('token');
      navigate('/signin');
    });
  // 1. Fetch all public/shared meals
  axios
    .get('http://localhost:4000/api/meal')
    .then(res => setAllMeals(res.data))
    .catch(err => console.error('Failed to load meals:', err));

  // 2. Fetch current user meals (only myMeals)
  axios
    .get('http://localhost:4000/api/users/me/myMeals', {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => {
      setUserMeals(res.data || []);
    })
    .catch(err => {
      console.error('Failed to load user meals:', err);
      localStorage.removeItem('token');
      navigate('/signin');
    });
}, [navigate]);


  const toggleSidebar = () => setSidebarVisible(v => !v);

  const filteredMeals = activeTab === 'my' ? userMeals : allMeals;

  const handleMealClick = meal => {
    setSelectedMeal(meal);
    setShowNutritionModal(true);
  };

  const closeNutritionModal = () => {
    setShowNutritionModal(false);
    setSelectedMeal(null);
  };


  const handleDeleteMeal = async (mealId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:4000/api/users/me/myMeals/${mealId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserMeals(prev => prev.filter(meal => meal._id !== mealId));
      closeNutritionModal();
    } catch (err) {
      console.error('Failed to delete meal:', err);
    }
  };

  // Add this function inside your component:

const handleSaveToMyMeals = async (meal) => {
  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/signin');
    return;
  }

  try {
    const payload = {
      name: meal.name,
      imageUrl: meal.imageUrl || meal.image || '',
      foodItems: meal.foodItems.map(item => ({
        food: typeof item.food === 'object' ? item.food._id : item.food,
        quantity: item.quantity
      }))
    };

    const res = await axios.post('http://localhost:4000/api/users/me/myMeals', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const newMeal = res.data.meal;
    
    // Update state with correct embedded meal (_id from user's myMeals)
    setUserMeals(prev => [...prev, newMeal]);
    setSelectedMeal(newMeal); // <-- this ensures correct _id is used for deletion
    alert('Meal saved to My Meals!');
  } catch (err) {
    console.error('Failed to save meal:', err);
    alert('Failed to save meal');
  }
};



  return (
    <div className="show-meal-page">
      <button className="toggle-btn" onClick={toggleSidebar}>
        &#8942;
      </button>

      {userData && (
        <Sidebar userData={userData} visible={sidebarVisible} />
      )}

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
                    className="meal-card clickable"
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

            {activeTab === 'all' && (
            <button className="save-to-my-meals-btn" onClick={() => handleSaveToMyMeals(selectedMeal)}>
              Save to My Meals
            </button>
          )}

            {activeTab === 'my' && (
              <button className="delete-meal-btn" onClick={() => handleDeleteMeal(selectedMeal._id)}>
                Delete from My Meals
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
