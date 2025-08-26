import React from "react";

const TimedMealConfig = ({ customLabel, onCustomLabelChange, onRemove, type, onTypeChange }) => {
  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow rounded-lg relative">
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 font-bold"
      >
        ✖
      </button>

      <div className="flex items-center justify-between space-x-4">
        <div className="flex-1">
          <input
            type="text"
            value={customLabel}
            onChange={(e) => onCustomLabelChange(e.target.value)}
            placeholder="Enter label"
            className="w-full mt-1 border border-gray-300 rounded-lg p-2 text-gray-700"
          />
        </div>

        <div className="flex-1">
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full mt-1 border border-gray-300 rounded-lg p-2 text-gray-700"
          >
            <option value="">--Choose--</option>
            <option value="breakfast">Breakfast</option>
            <option value="brunch">Brunch</option>
            <option value="lunch">Lunch</option>
            <option value="snack">Snack</option>
            <option value="supper">Supper</option>
            <option value="dinner">Dinner</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TimedMealConfig;
