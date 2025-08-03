import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from "../components/AdminSidebar";
import { useNavigate } from 'react-router-dom';
import './CreateMeal.css';

export default function AddIngreidentPage() {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [adminData, setAdminData] = useState({});

  useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/adminsignin');

      axios.get('http://localhost:5001/api/admin/me', {
      headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setAdminData(res.data))
      .catch(() => {
      localStorage.removeItem('token');
      navigate('/adminsignin');
      });
  }, [navigate]);


  
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    calories: '', 
    protein: '', 
    carbs: '', 
    fat: '' });

  const [share, setShare] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
  const handleLogout = () => { localStorage.clear(); navigate('/login'); };



  const handleRemoveIngredient = i => {
    setFormData(f => ({
      ...f,
      ingredients: f.ingredients.filter((_, idx) => idx !== i)
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
     try {
       const res = await axios.post(
       'http://localhost:5001/api/admin/foodItem',
       formData,
       { headers: { Authorization: `Bearer ${token}` } }
     );
     

       setSuccess(`"${res.data.name}" created successfully!`);
       // reset form
       setFormData({ name:'', category:'', calories:'', protein:'', carbs:'', fat:'' });
     } catch (err) {
       console.error('createFoodItem error:', err.response?.status, err.response?.data);
       setError(err.response?.data?.error || 'Failed to create food item');
     }
  };
  const handleChange = e => {
  const { name, value } = e.target;
  setFormData(f => ({ ...f, [name]: value }));
  };

  return (
    <div className="create-meal-page">
      <button className="toggle-btn" onClick={toggleSidebar}>⋮</button>
      <AdminSidebar visible={sidebarVisible} AdminData={adminData} onLogout={handleLogout} />

      <main className={`create-meal-content ${!sidebarVisible ? 'sidebar-hidden' : ''}`}>
        <div className="create-meal-container">
          <h2>Add New Ingredient</h2>
          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Ingredient Name</label>
              <input type="text" name="name" value={formData.name}
                onChange={handleChange} required />
              <label>Category</label>
              <input type="text" name="category" value={formData.category}
                onChange={handleChange} required />
            </div>
            
            
            <div className="nutrition-section">
              <h3>Total Nutrition</h3>
              <div className="nutrition-grid">
                {['calories', 'protein', 'carbs', 'fat'].map((name,index) => (
                  <div className="nutrition-input" key={index}>
                    <label>{name.charAt(0).toUpperCase() + name.slice(1)}</label>
                    <input type='number'
                    name={name}
                    inputMode='numeric'
                    step='any'
                    value={formData[name]}
                    onChange={handleChange}
                    required/>
                  </div>
                ))}

              </div>
            </div>
            <div className="btn-group">
              <button type="submit" className="save-btn" onClick={() => setShare(false)}>Save to System Collection</button>
            </div>
          </form>
        </div>
      </main>
    </div>

  );
}