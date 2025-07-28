import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Sidebar from './sideBar';
import './NutritionalRequirement.css';

export default function NutritionalRequirement() {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [userData, setUserData] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [formValues, setFormValues] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
  });
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(false);

  // Fetch user → get nutritionalRequirement
  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/signin');
    try {
      const res = await axios.get('http://localhost:4000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(res.data);
      setFormValues(res.data.nutritionalRequirement);
      setMode(res.data.manualNutrition);
    } catch {
      localStorage.clear();
      navigate('/signin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [navigate]);

  const toggleSidebar = () => setSidebarVisible(v => !v);

  const handleSetDefault = async () => {
    setLoading(true);
    // backend will recalc because manualNutrition = false
    await axios.put('http://localhost:4000/api/users/me', {
      manualNutrition: false
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setManualMode(false);
    setMode(false);
    fetchUser();
  };

  const handleSetManual = () => {
    setManualMode(true);
    setMode(true);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormValues(v => ({ ...v, [name]: value }));
  };

  const handleSaveManual = async () => {
    setLoading(true);
    await axios.put('http://localhost:4000/api/users/me', {
      manualNutrition: true,
      nutritionalRequirement: {
        calories: Number(formValues.calories),
        protein:  Number(formValues.protein),
        carbs:    Number(formValues.carbs),
        fats:     Number(formValues.fats),
      }
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setManualMode(false);
    fetchUser();
    console.log(setMode);
  };

  if (loading) return <div className="nutri-loading">Loading...</div>;

  const targets = userData.nutritionalRequirement;

  return (
    <div className="nutrition-page">
      <button className="toggle-btn" onClick={toggleSidebar}>⋮</button>
      {userData && (
        <Sidebar
          visible={sidebarVisible}
          userData={userData}
        />
      )}

      <div className="nutrition-card">
        <header>
          <h2>My Nutrition Targets</h2>
          <p className="calories">{targets.calories} kcal</p>
        </header>
        <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
            Mode: {mode ? 'Manual' : 'Default'}
        </div>
        <div className="mode-buttons">
          <button
            className="mode-btn"
            onClick={handleSetDefault}
            disabled={loading}
          >
            Set Default
          </button>
          <button
            className="mode-btn"
            onClick={handleSetManual}
            disabled={manualMode}
          >
            Set Manual
          </button>
        </div>

        {manualMode ? (
          <div className="manual-form">
            {['calories','protein','carbs','fats'].map(key => (
              <label key={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}:
                <input
                  type="number"
                  name={key}
                  value={formValues[key]}
                  onChange={handleChange}
                />
              </label>
            ))}
            <button className="save-manual-btn" onClick={handleSaveManual}>
              Save
            </button>
          </div>
        ) : (
          <ul className="nutrition-list">
            <li>
              <span className="dot yellow" />
              {targets.carbs} g Carbs
            </li>
            <li>
              <span className="dot cyan" />
              {targets.fats} g Fats
            </li>
            <li>
              <span className="dot purple" />
              {targets.protein} g Protein
            </li>
          </ul>
        )}
      </div>

    </div>
  );
}
