import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './sideBar';
import { useNavigate } from 'react-router-dom';
import './CreateMeal.css';

export default function CreateMeal() {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ingredients: [],
    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    imageFile: null,
  });

  const [share, setShare] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');

  const toggleSidebar = () => setSidebarVisible(v => !v);
  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const handleFileChange = e => {
    setFormData(f => ({ ...f, imageFile: e.target.files[0] }));
  };

  const handleRemoveIngredient = i => {
    setFormData(f => ({
      ...f,
      ingredients: f.ingredients.filter((_, idx) => idx !== i)
    }));
  };

  const handleSearchChange = async e => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query) return setSuggestions([]);

    try {
      const res = await axios.get(`http://localhost:4000/api/foodItem/search?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuggestions(res.data);
    } catch {
      setSuggestions([]);
    }
  };

  const handleAddIngredient = item => {
    setFormData(f => {
      if (f.ingredients.find(i => i._id === item._id)) return f;
      return {
        ...f,
        ingredients: [...f.ingredients, { ...item, quantity: 1 }]
      };
    });
    setSearchQuery('');
    setSuggestions([]);
  };

  useEffect(() => {
    const calculateNutrition = () => {
      const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      for (const item of formData.ingredients) {
        const qty = item.quantity || 1;
        totals.calories += item.calories * qty;
        totals.protein  += item.protein * qty;
        totals.carbs    += item.carbs * qty;
        totals.fat      += item.fat * qty;
      }
      setFormData(f => ({ ...f, nutrition: totals }));
    };
    calculateNutrition();
  }, [formData.ingredients]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('description', formData.description);
      fd.append('calories', formData.nutrition.calories);
      fd.append('protein', formData.nutrition.protein);
      fd.append('carbs', formData.nutrition.carbs);
      fd.append('fat', formData.nutrition.fat);
      fd.append('share', share);
      fd.append('foodItems', JSON.stringify(formData.ingredients.map(i => ({
        food: i._id,
        quantity: i.quantity || 1
      }))));
      if (formData.imageFile) fd.append('image', formData.imageFile);

      await axios.post('http://localhost:4000/api/users/me/myMeals', fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Meal saved successfully!');
      setFormData({
        name: '',
        description: '',
        ingredients: [],
        nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        imageFile: null
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    }
  };

  return (
    <div className="create-meal-page">
      <button className="toggle-btn" onClick={toggleSidebar}>⋮</button>
      <Sidebar visible={sidebarVisible} onLogout={handleLogout} />

      <main className={`create-meal-content ${!sidebarVisible ? 'sidebar-hidden' : ''}`}>
        <div className="create-meal-container">
          <h2>Create New Meal</h2>
          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Meal Name</label>
              <input type="text" name="name" value={formData.name}
                onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} required />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description}
                onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
            </div>

            <div className="form-group">
              <label>Meal Image</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label>Search Food Item</label>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Type to search..."
              />
              {suggestions.length > 0 && (
                <ul className="suggestions">
                  {suggestions.map(item => (
                    <li key={item._id} onClick={() => handleAddIngredient(item)}>
                      {item.name} – {item.calories} kcal
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="form-group">
              <label>Added Ingredients</label>
              {formData.ingredients.map((item, i) => (
                <div key={i} className="sel-item">
                  <input type="text" value={item.name} readOnly />
                  <input
                    type="number"
                    min="1"
                    value={item.quantity || 1}
                    onChange={e => {
                      const val = parseInt(e.target.value) || 1;
                      setFormData(f => {
                        const updated = [...f.ingredients];
                        updated[i] = { ...updated[i], quantity: val };
                        return { ...f, ingredients: updated };
                      });
                    }}
                  />
                  <button type="button" className="remove-btn" onClick={() => handleRemoveIngredient(i)}>×</button>
                </div>
              ))}
            </div>

            <div className="nutrition-section">
              <h3>Total Nutrition</h3>
              <div className="nutrition-grid">
                {['calories', 'protein', 'carbs', 'fat'].map(key => (
                  <div className="nutrition-input" key={key}>
                    <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                    <input type="number" value={formData.nutrition[key]} readOnly />
                  </div>
                ))}
              </div>
            </div>

            <div className="btn-group">
              <button type="submit" className="save-btn" onClick={() => setShare(false)}>Save to My Meals</button>
              <button type="submit" className="share-btn" onClick={() => setShare(true)}>Save & Share</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
