import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ShowAllMeal.css';
import logo from '../logo.png';

export default function ShowAllMeal() {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my'
  const [selectedMeal, setSelectedMeal] = useState(null);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleLogout = () => {
    navigate('/login');
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
      ingredients: ['Chicken Breast', 'Lettuce', 'Olive Oil'],
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
      ingredients: ['Oats', 'Banana', 'Berries'],
    },
  ];

  const filteredMeals = activeTab === 'my' ? [] : allMeals;

  return (
    <div className="show-meal-page">
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
              <button className="logout-btn" onClick={handleLogout}>Log out</button>
            </div>
          </div>
        </aside>
      )}

      {/* Main content */}
      <main className="show-meal-content">
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

        <div className="meal-list">
          {filteredMeals.map((meal) => (
            <div
              key={meal.id}
              className="meal-card"
              onClick={() => setSelectedMeal(meal)}
            >
              <img src={meal.image} alt={meal.name} />
              <h3>{meal.name}</h3>
              <p>Calories: {meal.calories}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Modal */}
      {selectedMeal && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={() => setSelectedMeal(null)}>
              &times;
            </button>

            <img src={selectedMeal.image} alt={selectedMeal.name} />
            <h2>{selectedMeal.name}</h2>

            <div className="modal-content">
              <div className="left">
                <h4>Ingredients</h4>
                <ul>
                  {selectedMeal.ingredients.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
                <button className="add-btn">add More</button>
              </div>
              <div className="right">
                <h4>Nutritions</h4>
                <ul>
                  <li>Calories: {selectedMeal.calories}</li>
                  <li>Fat: {selectedMeal.fat}g</li>
                  <li>Carbs: {selectedMeal.carbs}g</li>
                  <li>Fiber: {selectedMeal.fiber}g</li>
                  <li>Sugar: {selectedMeal.sugar}g</li>
                  <li>Protein: {selectedMeal.protein}g</li>
                  <li>Cholesterol: {selectedMeal.cholesterol}mg</li>
                  <li>Vitamin A: {selectedMeal.vitaminA}</li>
                  <li>Vitamin C: {selectedMeal.vitaminC}</li>
                </ul>
              </div>
            </div>

            <button className="save-btn">Save Changes</button>
          </div>
        </div>
      )}
    </div>
  );
}
