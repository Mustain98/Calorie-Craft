import React from "react";

export default function MealCard({ meal, onClick, compact = false }) {
  if (!meal) return null;

  const calories = (meal.totalCalories ?? 0);
  const protein  = (meal.totalProtein ?? 0);
  const carbs    = (meal.totalCarbs ?? 0);
  const fat      = (meal.totalFat ?? 0);

  return (
    <button
      type="button"
      onClick={() => onClick?.(meal)}
      className={`bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition text-left ${
        compact ? "w-full" : ""
      }`}
    >
      <img
        src={meal.imageUrl || meal.image}
        alt={meal.name}
        className={`${compact ? "h-28" : "max-h-40"} w-full object-cover`}
      />
      <div className="p-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 truncate">
          {meal.name}
        </h3>

        {Array.isArray(meal.categories) && meal.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {meal.categories.map((c, i) => (
              <span
                key={`${meal._id || i}-cat-${i}`}
                className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border"
              >
                {c}
              </span>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-600 mb-2">
          Calories: {Number(calories).toFixed(2)}
        </p>
        <div className="flex justify-between text-xs text-gray-500 font-medium">
          <span>Protein: {Number(protein).toFixed(2)}g</span>
          <span>Carbs: {Number(carbs).toFixed(2)}g</span>
          <span>Fat: {Number(fat).toFixed(2)}g</span>
        </div>
      </div>
    </button>
  );
}
