import React, { useState, useEffect } from "react";
import "../pages/CustomizeMeal.css";

function DynamicPercentageSliders({ mealCards, onMealConfigChange }) {
  const portionTypes = [
    "caloriePortion",
    "carbPortion",
    "proteinPortion",
    "fatPortion",
  ];

  const [selectedPortion, setSelectedPortion] = useState(portionTypes[0]);

  // Store separate sliders for each portion type
  const [slidersByPortion, setSlidersByPortion] = useState(
    portionTypes.reduce((acc, type) => {
      acc[type] = mealCards.map(() => 0);
      return acc;
    }, {})
  );

  const [mealconfig, setMealConfig] = useState([]);

  const colors = [
    "#e74c3c",
    "#3498db",
    "#2ecc71",
    "#9b59b6",
    "#f1c40f",
    "#1abc9c",
    "#e67e22",
    "#34495e",
    "#fd79a8",
    "#00cec9",
  ];

  // Ensure sliders arrays resize correctly if mealCards change
  useEffect(() => {
    setSlidersByPortion((prev) => {
      const updated = { ...prev };
      portionTypes.forEach((type) => {
        const oldSliders = prev[type] || [];
        const newSliders = [...oldSliders];
        while (newSliders.length < mealCards.length) newSliders.push(0);
        updated[type] = newSliders.slice(0, mealCards.length);
      });
      return updated;
    });
  }, [mealCards]);

  useEffect(() => {
    const config = mealCards.map((meal, index) => ({
      name: meal.name || "",
      type: meal.type || "",
      caloriePortion: (slidersByPortion["caloriePortion"]?.[index] || 0) / 100,
      carbPortion: (slidersByPortion["carbPortion"]?.[index] || 0) / 100,
      proteinPortion: (slidersByPortion["proteinPortion"]?.[index] || 0) / 100,
      fatPortion: (slidersByPortion["fatPortion"]?.[index] || 0) / 100,
      order: index,
    }));
    setMealConfig(config);

    onMealConfigChange(config);
  },[slidersByPortion]);

  const handleSliderChange = (index, newValueRaw) => {
    const sliders = slidersByPortion[selectedPortion] || [];
    const newValue = parseFloat(newValueRaw);
    const oldValue = sliders[index] || 0;
    const totalSum = sliders.reduce((acc, val) => acc + (val || 0), 0);
    const remaining = 100 - totalSum + oldValue;
    const limitedValue = Math.min(newValue, remaining);

    const updatedSliders = [...sliders];
    updatedSliders[index] = limitedValue;

    setSlidersByPortion((prev) => ({
      ...prev,
      [selectedPortion]: updatedSliders,
    }));
  };

  const sliders = slidersByPortion[selectedPortion] || [];

  return (
    <div className="slider-container">
      <h2>Customize The Nutritional Requirement</h2>

      {/* Dropdown for selecting portion type */}
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

      {mealCards.map((meal, index) => (
        <div key={index} className="slider-card">
          <label>{meal.type || "--No Name--"}</label>

          <label>
            {meal.name || ""}: {(sliders[index] || 0).toFixed(2)}%
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
              color: colors[index % colors.length],
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default DynamicPercentageSliders;
