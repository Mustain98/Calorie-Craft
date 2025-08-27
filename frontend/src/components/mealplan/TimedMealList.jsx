// src/components/mealplan/TimedMealList.jsx
import React from "react";
import TimedMealCard from "./TimedMealCard";

/**
 * Props:
 * - timedMeals: array of timedMeal docs (with choosenCombo, mealCombos populated)
 * - onOpenMealPreview(meal)
 * - onOpenCombos(timedMeal)
 * - onOpenReplace(timedMeal, replaceIndex?)
 * - onRemoveItem(timedMeal, index)
 */
export default function TimedMealList({
  onRegenerateTimedMeal,
  timedMeals = [],
  onOpenMealPreview,
  onOpenCombos,
  onRemoveItem,
  onOpenAddMeal
}) {
  if (!timedMeals.length) {
    return (
      <div className="mt-8 rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
        No meals planned for this day.
      </div>
    );
  }

  return (
    <section className="mt-6 space-y-3">
      {timedMeals.map((tm) => (
        <TimedMealCard
          key={tm._id}
          tm={tm}
          onRegenerate={() => onRegenerateTimedMeal?.(tm._id)}
          onOpenMealPreview={onOpenMealPreview}
          onOpenCombos={() => onOpenCombos?.(tm)}
          onRemoveItem={onRemoveItem}
          onOpenAddMeal={() => onOpenAddMeal?.(tm)}   // rename prop onOpenReplace → onOpenAddMeal
        />
      ))}
    </section>
  );
}
