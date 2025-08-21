import React, { useState } from 'react';
import './ExactGoalCard.css';

const GoalCard = () => {
  const [targetWeight, setTargetWeight] = useState('');
  const [targetTime, setTargetTime] = useState('');

  const handleSave = () => {
    if (targetWeight && targetTime) {
      const goalData = {
        targetWeight: parseFloat(targetWeight),
        targetTime: parseInt(targetTime),
        createdAt: new Date().toISOString()
      };
      
      console.log('Goal saved:', goalData);
      alert(`Goal saved!\nTarget weight: ${targetWeight} kg\nTarget time: ${targetTime} days`);
      
      // Reset form after saving
      setTargetWeight('');
      setTargetTime('');
    } else {
      alert('Please fill in both fields');
    }
  };

  return (
    <div className="goal-card-container">
      <h2 className="title">Exact goal card</h2>
      
      <div className="card">
        <div className="input-group">
          <button className="label-button">Target weight</button>
          <div className="input-container">
            <input
              type="number"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              className="input-field"
              placeholder=""
              step="0.1"
            />
            <span className="unit">kg</span>
          </div>
        </div>

        <div className="input-group">
          <button className="label-button">Target time</button>
          <div className="input-container">
            <input
              type="number"
              value={targetTime}
              onChange={(e) => setTargetTime(e.target.value)}
              className="input-field"
              placeholder=""
            />
            <span className="unit">days</span>
          </div>
        </div>

        <button className="save-button" onClick={handleSave}>
          save
        </button>
      </div>
    </div>
  );
};

export default GoalCard;