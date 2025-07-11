import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NutritionalRequirement.css';

export default function NutritionalRequirement() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/signin');

    axios
      .get('http://localhost:4000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setData(res.data.nutritionalRequirement);
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/signin');
      });
  }, [navigate]);

  if (!data) return <div className="nutri-loading">Loading...</div>;

  return (
    <div className="nutrition-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <div className="nutrition-card">
        <header>
          <h2>My Nutrition Targets</h2>
          <p className="calories">{data.calories} kcal</p>
        </header>
        <ul className="nutrition-list">
          <li>
            <span className="dot yellow" />
            {data.carbs} g Carbs
          </li>
          <li>
            <span className="dot cyan" />
            {data.fats} g Fats
          </li>
          <li>
            <span className="dot purple" />
            {data.protein} g Protein
          </li>
        </ul>
      </div>
    </div>
  );
}
