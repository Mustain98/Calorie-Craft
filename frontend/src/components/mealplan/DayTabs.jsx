// src/components/mealplan/DayTabs.jsx
import React from "react";

export default function DayTabs({ days = [], activeIndex = 0, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {days.map((d, i) => (
        <button
          key={d}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
            i === activeIndex
              ? "bg-lime-500 border-lime-500 text-white"
              : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
          onClick={() => onSelect(i)}
        >
          {d}
        </button>
      ))}
    </div>
  );
}
