import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ShowAllMeal.css';
import Navbar from './Navbar';

export default function ShowAllMeal() {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my'
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showNutritionModal, setShowNutritionModal] = useState(false);

  // Mock user data - in real app, this would come from context or API
  const userData = {
    name: 'Michael',
    email: 'michaelcraft67@gmail.com'
  };

  const allMeals = [
    {
      id: 1,
      name: 'Grilled Chicken Salad',
      image: 'https://source.unsplash.com/300x200/?grilled-chicken',
      calories: 248,
      fat: 6,
      carbs: 48,
      fiber: 12,
      sugar: 14,
      protein: 7,
      cholesterol: 10,
      vitaminA: '9357 IU',
      vitaminC: '13 mg',
      ingredients: ['Chicken Breast', 'Lettuce', 'Olive Oil', 'Cherry Tomatoes'],
    },
    {
      id: 2,
      name: 'Oatmeal with Fruits',
      image: 'https://source.unsplash.com/300x200/?oatmeal',
      calories: 210,
      fat: 4,
      carbs: 35,
      fiber: 10,
      sugar: 9,
      protein: 5,
      cholesterol: 0,
      vitaminA: '5100 IU',
      vitaminC: '10 mg',
      ingredients: ['Oats', 'Banana', 'Berries', 'Milk'],
    },
    {
      id: 3,
      name: 'Salmon with Vegetables',
      image: 'https://source.unsplash.com/300x200/?salmon',
      calories: 320,
      fat: 18,
      carbs: 12,
      fiber: 4,
      sugar: 6,
      protein: 28,
      cholesterol: 75,
      vitaminA: '1200 IU',
      vitaminC: '25 mg',
      ingredients: ['Salmon Fillet', 'Broccoli', 'Carrots', 'Olive Oil'],
    },
    {
      id: 4,
      name: 'Quinoa Bowl',
      image: 'https://source.unsplash.com/300x200/?quinoa',
      calories: 280,
      fat: 8,
      carbs: 42,
      fiber: 8,
      sugar: 4,
      protein: 12,
      cholesterol: 0,
      vitaminA: '3400 IU',
      vitaminC: '18 mg',
      ingredients: ['Quinoa', 'Black Beans', 'Avocado', 'Bell Peppers'],
    }
  ];

  // User's saved meals (empty for now, will be populated from backend)
  const userMeals = [];

  const filteredMeals = activeTab === 'my' ? userMeals : allMeals;

  const handleMealClick = (meal) => {
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
    // TODO: Implement save to backend
    console.log('Saving meal:', selectedMeal);
    closeNutritionModal();
  };

  return (
    <div className="show-meal-page">
      <Navbar 
        sidebarVisible={sidebarVisible}
        setSidebarVisible={setSidebarVisible}
        userData={userData}
        activePage="showmeal"
      />

      {/* Main content */}
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
          {/* White background card */}
          <div className="meal-list-card">
            <div className="meal-list">
              {filteredMeals.length === 0 ? (
                <div className="empty-state">
                  {activeTab === 'my' ? 'No saved meals yet' : 'No meals available'}
                </div>
              ) : (
                filteredMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className={`meal-card ${activeTab === 'all' ? 'clickable' : ''}`}
                    onClick={() => handleMealClick(meal)}
                  >
                    <img src={meal.image} alt={meal.name} />
                    <div className="meal-card-content">
                      <h3>{meal.name}</h3>
                      <p className="calories">Calories: {meal.calories}</p>
                      <div className="meal-macros">
                        <span>Protein: {meal.protein}g</span>
                        <span>Carbs: {meal.carbs}g</span>
                        <span>Fat: {meal.fat}g</span>
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
          <div className="nutrition-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeNutritionModal}>
              &times;
            </button>

            <div className="modal-header">
              <img src={selectedMeal.image} alt={selectedMeal.name} className="modal-image" />
              <h2 className="modal-title">{selectedMeal.name}</h2>
            </div>

            <div className="modal-content">
              <div className="ingredients-section">
                <h3>Ingredients</h3>
                <div className="ingredients-list">
                  {selectedMeal.ingredients.map((ingredient, index) => (
                    <div key={index} className="ingredient-item">
                      <img 
                        src={`https://source.unsplash.com/60x60/?${ingredient.toLowerCase()}`} 
                        alt={ingredient}
                        className="ingredient-image"
                      />
                      <span>{ingredient}</span>
                    </div>
                  ))}
                </div>
                <button className="add-more-btn">add More</button>
              </div>

              <div className="nutrition-section">
                <h3>Nutritions</h3>
                <div className="nutrition-grid">
                  <div className="nutrition-item">
                    <span className="nutrition-label">Calories</span>
                    <span className="nutrition-value">{selectedMeal.calories}</span>
                    <div className="nutrition-bar">
                      <div className="nutrition-fill" style={{width: '12%', backgroundColor: '#ff6b6b'}}></div>
                    </div>
                    <span className="nutrition-percent">12%</span>
                  </div>

                  <div className="nutrition-item">
                    <span className="nutrition-label">Fat</span>
                    <span className="nutrition-value">{selectedMeal.fat}g</span>
                    <div className="nutrition-bar">
                      <div className="nutrition-fill" style={{width: '0%', backgroundColor: '#4ecdc4'}}></div>
                    </div>
                    <span className="nutrition-percent">0%</span>
                  </div>

                  <div className="nutrition-item">
                    <span className="nutrition-label">Carbs</span>
                    <span className="nutrition-value">{selectedMeal.carbs}g</span>
                    <div className="nutrition-bar">
                      <div className="nutrition-fill" style={{width: '16%', backgroundColor: '#45b7d1'}}></div>
                    </div>
                    <span className="nutrition-percent">16%</span>
                  </div>

                  <div className="nutrition-item">
                    <span className="nutrition-label">Fiber</span>
                    <span className="nutrition-value">{selectedMeal.fiber}g</span>
                    <div className="nutrition-bar">
                      <div className="nutrition-fill" style={{width: '43%', backgroundColor: '#96ceb4'}}></div>
                    </div>
                    <span className="nutrition-percent">43%</span>
                  </div>

                  <div className="nutrition-item">
                    <span className="nutrition-label">Sugar</span>
                    <span className="nutrition-value">{selectedMeal.sugar}g</span>
                    <div className="nutrition-bar">
                      <div className="nutrition-fill" style={{width: '10%', backgroundColor: '#feca57'}}></div>
                    </div>
                    <span className="nutrition-percent">10%</span>
                  </div>

                  <div className="nutrition-item">
                    <span className="nutrition-label">Protein</span>
                    <span className="nutrition-value">{selectedMeal.protein}g</span>
                    <div className="nutrition-bar">
                      <div className="nutrition-fill" style={{width: '14%', backgroundColor: '#ff9ff3'}}></div>
                    </div>
                    <span className="nutrition-percent">14%</span>
                  </div>

                  <div className="nutrition-item">
                    <span className="nutrition-label">Cholesterol</span>
                    <span className="nutrition-value">{selectedMeal.cholesterol}mg</span>
                    <div className="nutrition-bar">
                      <div className="nutrition-fill" style={{width: '20%', backgroundColor: '#54a0ff'}}></div>
                    </div>
                    <span className="nutrition-percent">20%</span>
                  </div>

                  <div className="nutrition-item">
                    <span className="nutrition-label">Vitamin A</span>
                    <span className="nutrition-value">{selectedMeal.vitaminA}</span>
                    <div className="nutrition-bar">
                      <div className="nutrition-fill" style={{width: '26%', backgroundColor: '#5f27cd'}}></div>
                    </div>
                    <span className="nutrition-percent">26%</span>
                  </div>

                  <div className="nutrition-item">
                    <span className="nutrition-label">Vitamin C</span>
                    <span className="nutrition-value">{selectedMeal.vitaminC}</span>
                    <div className="nutrition-bar">
                      <div className="nutrition-fill" style={{width: '14%', backgroundColor: '#00d2d3'}}></div>
                    </div>
                    <span className="nutrition-percent">14%</span>
                  </div>
                </div>

                <button className="more-btn">More</button>
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