import React, { useState, useEffect } from 'react';
import './MealCreate.css';

const dummyFoodItems = [
  { _id: '1', name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { _id: '2', name: 'Brown Rice', calories: 216, protein: 5, carbs: 44, fat: 1.8 },
  { _id: '3', name: 'Broccoli', calories: 55, protein: 3.7, carbs: 11, fat: 0.3 },
];

export default function MealCreate() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ingredients: [],
    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    imageFile: null,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleFileChange = e => {
    setFormData(f => ({ ...f, imageFile: e.target.files[0] }));
  };

  const handleSearchChange = e => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query) return setSuggestions([]);
    const filtered = dummyFoodItems.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const handleAddIngredient = item => {
    if (formData.ingredients.find(i => i._id === item._id)) return;
    setFormData(f => ({
      ...f,
      ingredients: [...f.ingredients, { ...item, quantity: 1 }],
    }));
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleRemoveIngredient = index => {
    const updated = [...formData.ingredients];
    updated.splice(index, 1);
    setFormData(f => ({ ...f, ingredients: updated }));
  };

  useEffect(() => {
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (const item of formData.ingredients) {
      const qty = item.quantity || 1;
      totals.calories += item.calories * qty;
      totals.protein += item.protein * qty;
      totals.carbs += item.carbs * qty;
      totals.fat += item.fat * qty;
    }
    setFormData(f => ({ ...f, nutrition: totals }));
  }, [formData.ingredients]);

  const handleSubmit = e => {
    e.preventDefault();
    alert('Meal created (dummy only)');
  };

  return (
    <div className="meal-create-page">
      <div className="meal-create-container">
        <h2>Create New Meal</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Meal Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Meal Image</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label>Search Ingredient</label>
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
            {formData.ingredients.map((item, index) => (
              <div key={index} className="sel-item">
                <input type="text" value={item.name} readOnly />
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={e => {
                    const val = parseInt(e.target.value) || 1;
                    const updated = [...formData.ingredients];
                    updated[index].quantity = val;
                    setFormData(f => ({ ...f, ingredients: updated }));
                  }}
                />
                <button type="button" className="remove-btn" onClick={() => handleRemoveIngredient(index)}>×</button>
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

          <button className="submit-btn" type="submit">Create Meal</button>
        </form>
      </div>
    </div>
  );
}
