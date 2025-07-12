import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreateMeal.css';

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
    },
    image: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
  const handleLogout = () => navigate('/login');

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({...formData, image: file});
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Rest of your existing handlers (addIngredient, removeIngredient, etc.)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNutritionChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      nutrition: { ...prev.nutrition, [name]: value }
    }));
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
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

      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('description', formData.description);
      formData.ingredients.forEach(ing => formPayload.append('ingredients', ing));
      formPayload.append('nutrition', JSON.stringify(formData.nutrition));
      if (formData.image) {
        formPayload.append('image', formData.image);
      }

      await axios.post('http://localhost:4000/api/meal', formPayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Meal created successfully!');
      // Reset form
      setFormData({
        name: '',
        description: '',
        ingredients: [''],
        nutrition: { calories: '', protein: '', carbs: '', fat: '' },
        image: null
      });
      setPreviewImage(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create meal');
    }
  };

  return (
    <div className="create-meal-page">
      <button className="toggle-btn" onClick={toggleSidebar}>
        &#8942;
      </button>

      {/* Sidebar (unchanged from your original) */}
      {sidebarVisible && (
        <aside className="sidebar">
          {/* ... your existing sidebar code ... */}
        </aside>
      )}

      <main className={`create-meal-content ${!sidebarVisible ? 'sidebar-hidden' : ''}`}>
        <div className="create-meal-container">
          <h2>Create New Meal</h2>
          
          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}

          <form onSubmit={handleSubmit}>
            {/* Image Upload Section */}
            <div className="form-group image-upload-group">
              <label>Meal Image</label>
              <div className="image-upload-container">
                <label htmlFor="image-upload" className="image-upload-label">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="image-preview" />
                  ) : (
                    <div className="image-upload-placeholder">
                      <span>+ Upload Image</span>
                    </div>
                  )}
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="image-upload-input"
                />
                {previewImage && (
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => {
                      setPreviewImage(null);
                      setFormData({...formData, image: null});
                    }}
                  >
                    Remove Image
                  </button>
                )}
              </div>
            </div>

            {/* Rest of your form (unchanged) */}
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

            {/* ... rest of your existing form fields ... */}

            <button type="submit" className="submit-btn">
              Create Meal
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}