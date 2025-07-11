import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreateMeal.css';
import Sidebar from './sideBar';

export default function CreateMeal() {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ingredients: [''],
    nutrition: {
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
    }
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNutritionChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      nutrition: {
        ...prev.nutrition,
        [name]: value
      }
    }));
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.post('http://localhost:4000/api/meal', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccess('Meal created successfully!');
      setFormData({
        name: '',
        description: '',
        ingredients: [''],
        nutrition: {
          calories: '',
          protein: '',
          carbs: '',
          fat: ''
        }
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create meal');
    }
  };

  return (
    <div className="create-meal-page">
      <button className="toggle-btn" onClick={toggleSidebar}>
        &#8942;
      </button>

      <Sidebar
        visible={sidebarVisible}
        onLogout={handleLogout}
      />

      <main className={`create-meal-content ${!sidebarVisible ? 'sidebar-hidden' : ''}`}>
        <div className="create-meal-container">
          <h2>Create New Meal</h2>
          
          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Meal Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Ingredients</label>
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="ingredient-input">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    required
                  />
                  {formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeIngredient(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="add-btn"
                onClick={addIngredient}
              >
                + Add Ingredient
              </button>
            </div>

            <div className="nutrition-section">
              <h3>Nutrition Information</h3>
              <div className="nutrition-grid">
                <div className="nutrition-input">
                  <label>Calories (kcal)</label>
                  <input
                    type="number"
                    name="calories"
                    value={formData.nutrition.calories}
                    onChange={handleNutritionChange}
                    required
                  />
                </div>
                <div className="nutrition-input">
                  <label>Protein (g)</label>
                  <input
                    type="number"
                    name="protein"
                    value={formData.nutrition.protein}
                    onChange={handleNutritionChange}
                    required
                  />
                </div>
                <div className="nutrition-input">
                  <label>Carbs (g)</label>
                  <input
                    type="number"
                    name="carbs"
                    value={formData.nutrition.carbs}
                    onChange={handleNutritionChange}
                    required
                  />
                </div>
                <div className="nutrition-input">
                  <label>Fat (g)</label>
                  <input
                    type="number"
                    name="fat"
                    value={formData.nutrition.fat}
                    onChange={handleNutritionChange}
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="submit-btn">
              Create Meal
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}