import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ShowAllMeal.css';
import Sidebar from './sideBar';

export default function ShowAllMeal() {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [meals, setMeals] = useState([]);
  const [userMeals, setUserMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [newIngredient, setNewIngredient] = useState('');
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  // Fetch all meals and user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch all meals
        const mealsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/meals`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMeals(mealsRes.data);

        // Fetch user's saved meals
        const userRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(userRes.data);
        setUserMeals(userRes.data.savedMeals || []);

      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchData();
  }, [navigate]);

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleMealClick = (meal) => {
    setSelectedMeal(meal);
    setShowNutritionModal(true);
    setShowAddIngredient(false);
    setNewIngredient('');
  };

  const closeNutritionModal = () => {
    setShowNutritionModal(false);
    setSelectedMeal(null);
  };

  const handleAddIngredient = async () => {
    if (!newIngredient.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/meals/${selectedMeal._id}/ingredients`,
        { ingredient: newIngredient.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedMeal(res.data.updatedMeal);
      setMeals(meals.map(meal => 
        meal._id === res.data.updatedMeal._id ? res.data.updatedMeal : meal
      ));
      setNewIngredient('');
      setShowAddIngredient(false);
    } catch (err) {
      console.error('Error adding ingredient:', err);
      alert('Failed to add ingredient');
    }
  };

  const handleSaveMeal = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/save-meal`,
        { mealId: selectedMeal._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh user meals
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserMeals(res.data.savedMeals || []);
      
      alert('Meal saved successfully!');
      closeNutritionModal();
    } catch (err) {
      console.error('Error saving meal:', err);
      alert('Failed to save meal');
    } finally {
      setLoading(false);
    }
  };

  const filteredMeals = activeTab === 'my' ? userMeals : meals;

  return (
    <div className="show-meal-page">
      <button className="toggle-btn" onClick={toggleSidebar}>
        ☰
      </button>

      {sidebarVisible && userData && (
        <Sidebar
          userData={userData}
          onLogout={handleLogout}
          visible={sidebarVisible}
        />
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
                    className={`meal-card ${activeTab === 'all' ? 'clickable' : ''}`}
                    onClick={() => activeTab === 'all' && handleMealClick(meal)}
                  >
                    <div className="meal-card-image-container">
                      <img
                        src={`${process.env.REACT_APP_API_URL}/${meal.imageUrl}`}
                        alt={meal.name}
                        className="meal-card-image"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=Meal+Image';
                        }}
                      />
                    </div>
                    <div className="meal-card-content">
                      <h3 className="meal-card-title">{meal.name}</h3>
                      <div className="meal-card-macros">
                        <span className="macro-protein">{meal.nutrition.protein.value} Protein</span>
                        <span className="macro-carbs">{meal.nutrition.carbs.value} Carbs</span>
                        <span className="macro-fat">{meal.nutrition.fat.value} Fat</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {showNutritionModal && selectedMeal && (
        <div className="modal-overlay" onClick={closeNutritionModal}>
          <div className="nutrition-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeNutritionModal}>
              ×
            </button>

            <div className="modal-header">
              <img
                src={`${process.env.REACT_APP_API_URL}/${selectedMeal.imageUrl}`}
                alt={selectedMeal.name}
                className="modal-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x400?text=Meal+Image';
                }}
              />
              <h2 className="modal-title">{selectedMeal.name}</h2>
            </div>

            <div className="modal-sections">
              <div className="ingredients-section gray-bg">
                <div className="ingredients-header">
                  <h3>Ingredients</h3>
                  <button 
                    className="toggle-add-ingredient"
                    onClick={() => setShowAddIngredient(!showAddIngredient)}
                  >
                    {showAddIngredient ? 'Cancel' : 'Add Ingredient +'}
                  </button>
                </div>

                {showAddIngredient && (
                  <div className="add-ingredient-form">
                    <input
                      type="text"
                      value={newIngredient}
                      onChange={(e) => setNewIngredient(e.target.value)}
                      placeholder="Enter new ingredient"
                      className="ingredient-input"
                    />
                    <button 
                      onClick={handleAddIngredient}
                      className="add-ingredient-btn"
                    >
                      Add
                    </button>
                  </div>
                )}

                <ul className="ingredients-list">
                  {selectedMeal.ingredients.map((ingredient, index) => (
                    <li key={index} className="ingredient-item">
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="nutrition-section gray-bg">
                <h3>Nutritions</h3>
                <div className="nutrition-grid">
                  {Object.entries(selectedMeal.nutrition).map(([key, value]) => (
                    <div key={key} className="nutrition-row">
                      <span className="nutrition-label">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                      <span className="nutrition-value">
                        {value.value} <span className="nutrition-percentage">* {value.percentage}%</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="save-btn" 
                onClick={handleSaveMeal}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}