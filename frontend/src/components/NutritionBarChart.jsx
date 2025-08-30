// src/components/mealplan/NutritionBarChart.jsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  requirement: "#34d399", // green
  planned: "#3b82f6",     // blue
};

// Single nutrient bar chart
function SingleNutrientChart({ nutrient, requirement, planned }) {
  const data = [
    { name: nutrient, Requirement: requirement, Planned: planned },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="text-sm font-semibold text-gray-800 mb-2 text-center">
        {nutrient}
      </div>
      <div style={{ width: "100%", height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#374151" }} />
            <YAxis tick={{ fontSize: 12, fill: "#374151" }} allowDecimals={false} />
            <Tooltip formatter={(value, name) => [`${value}`, name]} />
            <Bar dataKey="Requirement" fill={COLORS.requirement} radius={[4, 4, 0, 0]} barSize={40} />
            <Bar dataKey="Planned" fill={COLORS.planned} radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function NutritionBarChart({ userReq = {}, dayTotals = {} }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <SingleNutrientChart
        nutrient="Calories"
        requirement={userReq.calories || 0}
        planned={dayTotals.calories || 0}
      />
      <SingleNutrientChart
        nutrient="Protein"
        requirement={userReq.protein || 0}
        planned={dayTotals.protein || 0}
      />
      <SingleNutrientChart
        nutrient="Carbs"
        requirement={userReq.carbs || 0}
        planned={dayTotals.carbs || 0}
      />
      <SingleNutrientChart
        nutrient="Fat"
        requirement={userReq.fats || 0}
        planned={dayTotals.fat || 0}
      />
    </div>
  );
}


