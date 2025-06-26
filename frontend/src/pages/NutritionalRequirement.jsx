import React, { useEffect, useState } from 'react';
import './NutritionalRequirement.css';
import { useNavigate } from 'react-router-dom';

export default function NutritionalRequirement() {
  const navigate = useNavigate();

  const [nutritionData, setNutritionData] = useState({
    calories: 1475,
    carbs: { min: 13, max: 185 },
    fats: { min: 39, max: 82 },
    proteins: { min: 56, max: 185 },
  });

  // Future backend fetch will go here
  useEffect(() => {
    // fetch('/api/nutrition').then(...).then(data => setNutritionData(data));
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="nutrition-page">
      <button className="back-btn" onClick={handleBack}>← Back</button>

      <div className="nutrition-card">
        <h2>My Nutrition Targets</h2>
        <p className="calories">{nutritionData.calories} Calories</p>
        <ul className="nutrition-list">
          <li><span className="dot yellow"></span>{nutritionData.carbs.min} - {nutritionData.carbs.max}g Carbs</li>
          <li><span className="dot cyan"></span>{nutritionData.fats.min} - {nutritionData.fats.max}g Fats</li>
          <li><span className="dot purple"></span>{nutritionData.proteins.min} - {nutritionData.proteins.max}g Proteins</li>
        </ul>
      </div>
    </div>
  );
}
