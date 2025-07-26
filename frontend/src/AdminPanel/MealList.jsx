import React, { useState } from 'react';
import './MealList.css';

const dummyMeals = [
  { 
    _id: 1, 
    name: 'Chicken Salad', 
    imageUrl: 'https://source.unsplash.com/300x200/?chicken,salad',
    totalCalories: 350,
    totalProtein: 30,
    totalCarbs: 10,
    totalFat: 20,
    foodItems: [
      { food: { name: 'Chicken Breast' }, quantity: 1 },
      { food: { name: 'Lettuce' }, quantity: 2 },
      { food: { name: 'Tomato' }, quantity: 1 },
      { food: { name: 'Olive Oil' }, quantity: 1 }
    ]
  },
  { 
    _id: 2, 
    name: 'Oats & Fruits', 
    imageUrl: 'https://source.unsplash.com/300x200/?oats,fruits',
    totalCalories: 300,
    totalProtein: 10,
    totalCarbs: 50,
    totalFat: 5,
    foodItems: [
      { food: { name: 'Oats' }, quantity: 1 },
      { food: { name: 'Banana' }, quantity: 1 },
      { food: { name: 'Blueberries' }, quantity: 0.5 },
      { food: { name: 'Almond Milk' }, quantity: 1 }
    ]
  },
];

export default function MealList() {
  const [meals, setMeals] = useState(dummyMeals);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const toggleSidebar = () => setSidebarVisible(v => !v);

  const handleMealClick = (meal) => {
    setSelectedMeal(meal);
    setShowNutritionModal(true);
  };

  const closeNutritionModal = () => {
    setShowNutritionModal(false);
    setSelectedMeal(null);
    setEditingMeal(null);
  };

  const handleDeleteMeal = (mealId) => {
    setMeals(meals.filter(meal => meal._id !== mealId));
    closeNutritionModal();
  };

  const handleEditMeal = (meal) => {
    setEditingMeal({...meal});
  };

  const handleSaveChanges = () => {
    if (!editingMeal) return;
    
    setMeals(meals.map(meal => 
      meal._id === editingMeal._id ? editingMeal : meal
    ));
    setSelectedMeal(editingMeal);
    setEditingMeal(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingMeal({
      ...editingMeal,
      [name]: value
    });
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedFoodItems = [...editingMeal.foodItems];
    if (field === 'name') {
      updatedFoodItems[index] = {
        ...updatedFoodItems[index],
        food: { ...updatedFoodItems[index].food, name: value }
      };
    } else {
      updatedFoodItems[index] = {
        ...updatedFoodItems[index],
        [field]: value
      };
    }
    
    setEditingMeal({
      ...editingMeal,
      foodItems: updatedFoodItems
    });
  };

  return (
    <div className="show-meal-page">
      <button className="toggle-btn" onClick={toggleSidebar}>
        &#8942;
      </button>

      <main className={`show-meal-content ${!sidebarVisible ? 'sidebar-hidden' : ''}`}>
        <div className="meal-container">
          <div className="meal-list-card">
            <h2>Meal Collection</h2>
            <div className="meal-list">
              {meals.length === 0 ? (
                <div className="empty-state">No meals available</div>
              ) : (
                meals.map(meal => (
                  <div
                    key={meal._id}
                    className="meal-card"
                  >
                    <img src={meal.imageUrl} alt={meal.name} />
                    <div className="meal-card-content">
                      <h3>{meal.name}</h3>
                      <p className="calories">Calories: {meal.totalCalories}</p>
                      <div className="meal-macros">
                        <span>Protein: {meal.totalProtein}g</span>
                        <span>Carbs: {meal.totalCarbs}g</span>
                        <span>Fat: {meal.totalFat}g</span>
                      </div>
                      <div className="meal-actions">
                        <button 
                          className="edit-btn"
                          onClick={() => handleMealClick(meal)}
                        >
                          View
                        </button>
                        <button 
                          className="edit-btn"
                          onClick={() => handleEditMeal(meal)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteMeal(meal._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Nutrition/Edit Modal */}
      {showNutritionModal && selectedMeal && (
        <div className="modal-overlay" onClick={closeNutritionModal}>
          <div className="nutrition-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeNutritionModal}>
              &times;
            </button>

            <div className="modal-header">
              <img
                src={selectedMeal.imageUrl}
                alt={selectedMeal.name}
                className="modal-image"
              />
              {editingMeal ? (
                <input
                  type="text"
                  name="name"
                  value={editingMeal.name}
                  onChange={handleInputChange}
                  className="edit-input"
                />
              ) : (
                <h2 className="modal-title">{selectedMeal.name}</h2>
              )}
            </div>

            <div className="modal-content">
              <div className="ingredients-section">
                <h3>Ingredients</h3>
                <div className="ingredients-list">
                  {(editingMeal ? editingMeal.foodItems : selectedMeal.foodItems).map((item, idx) => (
                    <div key={idx} className="ingredient-item">
                      <img
                        src={`https://source.unsplash.com/60x60/?${item.food.name}`}
                        alt={item.food.name}
                        className="ingredient-image"
                      />
                      {editingMeal ? (
                        <div className="ingredient-edit">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleIngredientChange(idx, 'quantity', e.target.value)}
                            className="edit-quantity"
                          />
                          <span>×</span>
                          <input
                            type="text"
                            value={item.food.name}
                            onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                            className="edit-name"
                          />
                        </div>
                      ) : (
                        <span>
                          {item.quantity}× {item.food.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="nutrition-section">
                <h3>Nutrition</h3>
                <div className="nutrition-grid">
                  <div className="nutrition-item">
                    <span className="nutrition-label">Calories</span>
                    {editingMeal ? (
                      <input
                        type="number"
                        name="totalCalories"
                        value={editingMeal.totalCalories}
                        onChange={handleInputChange}
                        className="edit-input"
                      />
                    ) : (
                      <span className="nutrition-value">{selectedMeal.totalCalories}</span>
                    )}
                  </div>
                  <div className="nutrition-item">
                    <span className="nutrition-label">Protein</span>
                    {editingMeal ? (
                      <input
                        type="number"
                        name="totalProtein"
                        value={editingMeal.totalProtein}
                        onChange={handleInputChange}
                        className="edit-input"
                      />
                    ) : (
                      <span className="nutrition-value">{selectedMeal.totalProtein}g</span>
                    )}
                  </div>
                  <div className="nutrition-item">
                    <span className="nutrition-label">Carbs</span>
                    {editingMeal ? (
                      <input
                        type="number"
                        name="totalCarbs"
                        value={editingMeal.totalCarbs}
                        onChange={handleInputChange}
                        className="edit-input"
                      />
                    ) : (
                      <span className="nutrition-value">{selectedMeal.totalCarbs}g</span>
                    )}
                  </div>
                  <div className="nutrition-item">
                    <span className="nutrition-label">Fat</span>
                    {editingMeal ? (
                      <input
                        type="number"
                        name="totalFat"
                        value={editingMeal.totalFat}
                        onChange={handleInputChange}
                        className="edit-input"
                      />
                    ) : (
                      <span className="nutrition-value">{selectedMeal.totalFat}g</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              {editingMeal ? (
                <>
                  <button className="save-btn" onClick={handleSaveChanges}>
                    Save Changes
                  </button>
                  <button className="cancel-btn" onClick={() => setEditingMeal(null)}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button className="edit-btn" onClick={() => handleEditMeal(selectedMeal)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDeleteMeal(selectedMeal._id)}>
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}