import React, { useState, useEffect } from "react";
import "./timedMealSetting.css";

function DynamicPercentageSliders({ mealCards, slidersByPortion, onChange }) {
  const portionTypes = ["caloriePortion", "carbPortion", "proteinPortion", "fatPortion"];
  const [selectedPortion, setSelectedPortion] = useState(portionTypes[0]);

  const colors = ["#e74c3c","#3498db","#2ecc71","#9b59b6","#f1c40f","#1abc9c","#e67e22","#34495e","#fd79a8","#00cec9"];

  // ensure arrays match mealCards length
  useEffect(() => {
    const next = { ...slidersByPortion };
    portionTypes.forEach((type) => {
      const arr = Array.isArray(next[type]) ? [...next[type]] : [];
      while (arr.length < mealCards.length) arr.push(0);
      next[type] = arr.slice(0, mealCards.length);
    });
    if (JSON.stringify(next) !== JSON.stringify(slidersByPortion)) {
      onChange(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mealCards.length]);

  const sliders = slidersByPortion[selectedPortion] || [];

  const handleSliderChange = (index, newValueRaw) => {
    const newValue = parseFloat(newValueRaw);
    const current = slidersByPortion[selectedPortion] || [];
    const oldValue = current[index] || 0;
    const total = current.reduce((a, b) => a + (b || 0), 0);
    const remaining = 100 - total + oldValue;
    const limited = Math.min(newValue, remaining);

    const next = { ...slidersByPortion };
    next[selectedPortion] = [...current];
    next[selectedPortion][index] = limited;
    onChange(next);
  };

  return (
    <div className="slider-container">
      <h2>Customize The Nutritional Requirement</h2>

      <select
        className="meal-input mb-6"
        value={selectedPortion}
        onChange={(e) => setSelectedPortion(e.target.value)}
      >
        {portionTypes.map((type) => (
          <option key={type} value={type}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </option>
        ))}
      </select>

      {mealCards.map((card, index) => {
        const cardLabel = card.name || `Meal ${index + 1}`;
        const cardId = card.id || index; // use card id for stable color

        return (
          <div key={cardId} className="slider-card">
            <label>
              {cardLabel}: {(sliders[index] || 0).toFixed(2)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={sliders[index] || 0}
              onChange={(e) => handleSliderChange(index, e.target.value)}
              style={{
                "--percent": `${sliders[index] || 0}%`,
                color: colors[cardId % colors.length],
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default DynamicPercentageSliders;

