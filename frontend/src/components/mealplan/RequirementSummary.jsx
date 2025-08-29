// src/components/mealplan/RequirementSummary.jsx
import React, { useMemo } from "react";
import NutritionPieChart from "../NutritionPieChart";
import NutritionBarChart from "../NutritionBarChart";

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

export default function RequirementSummary({ user, dayDoc }) {
  const userReq = user?.nutritionalRequirement || {};

  const dayTotals = useMemo(() => {
    const tms = Array.isArray(dayDoc?.timedMeals) ? dayDoc.timedMeals : [];
    const roll = tms.reduce(
      (t, tm) => {
        t.calories += Number(tm.totalCalories || 0);
        t.protein += Number(tm.totalProtein || 0);
        t.carbs += Number(tm.totalCarbs || 0);
        t.fat += Number(tm.totalFat || 0);
        return t;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    return {
      calories: Math.round(roll.calories),
      protein: Math.round(roll.protein),
      carbs: Math.round(roll.carbs),
      fat: Math.round(roll.fat),
    };
  }, [dayDoc]);

  return (
    <section className="mt-6">
      <div className="mb-2 text-xs uppercase tracking-wide text-gray-500">
        Compare
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-sm font-semibold text-gray-800 mb-2">
            Your Daily Requirement
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Calories" value={Math.round(userReq.calories || 0)} />
            <Stat
              label="Protein"
              value={`${Math.round(userReq.protein || 0)} g`}
            />
            <Stat label="Carbs" value={`${Math.round(userReq.carbs || 0)} g`} />
            <Stat label="Fat" value={`${Math.round(userReq.fats || 0)} g`} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-sm font-semibold text-gray-800 mb-2">
            Planned Today
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Calories" value={dayTotals.calories} />
            <Stat label="Protein" value={`${dayTotals.protein} g`} />
            <Stat label="Carbs" value={`${dayTotals.carbs} g`} />
            <Stat label="Fat" value={`${dayTotals.fat} g`} />
          </div>
        </div>
      </div>
      <NutritionBarChart userReq={userReq} dayTotals={dayTotals} />
    </section>
  );
}
