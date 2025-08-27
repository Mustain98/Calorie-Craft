// src/components/mealplan/CombosModal.jsx
import React from "react";
import MealCard from "../MealComponents/MealCard";
import { formatFraction } from "./utils";

export default function CombosModal({ tm, onClose, onChoose, onPreviewMeal }) {
  const combos = tm?.mealCombos || [];

  return (
    <div className="fixed inset-0 z-[4200] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="relative max-h-[90vh] w-full max-w-5xl overflow-auto rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <h3 className="text-base font-semibold text-gray-900">Other combos — {tm.name}</h3>
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {combos.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
            No alternative combos available.
          </div>
        ) : (
          <div className="mt-5 space-y-6">
            {combos.map((c, i) => (
              <div key={`combo-${i}`} className="rounded-xl border border-gray-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-800">Combo #{i + 1}</div>
                  <button
                    className="rounded-md bg-lime-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-lime-600"
                    onClick={() => onChoose?.(i)}
                  >
                    Choose
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(c.meals || []).map((it, idx) => {
                   const mealDoc = it.meal || it.userMeal || it;
                    const qty = Number(it.quantity || 0);
                    return (
                      <div key={`combo-${i}-meal-${idx}`}>
                        <MealCard meal={mealDoc} compact onClick={() => onPreviewMeal?.(mealDoc)} />
                        <div className="mt-1 text-xs text-gray-700">
                          Portion: <span className="font-semibold">{formatFraction(qty)}×</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
