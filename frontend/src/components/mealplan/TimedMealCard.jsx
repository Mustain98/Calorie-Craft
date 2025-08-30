// src/components/mealplan/TimedMealCard.jsx
import React, { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import MealCard from "../MealComponents/MealCard";
import { formatFraction } from "./utils";
import TimedMealMenu from "./TimedMealMenu";

// Simple loader component (you can replace with your preferred spinner)
function CardLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-50">
      <div className="w-6 h-6 border-4 border-gray-300 border-t-lime-500 rounded-full animate-spin"></div>
    </div>
  );
}

function MenuPortal({ anchorRect, onClose, children, width = 220 }) {
  if (!anchorRect) return null;
  const padding = 8;
  const left = Math.min(
    Math.max(padding, anchorRect.right - width),
    window.innerWidth - width - padding
  );
  const top = Math.min(anchorRect.bottom + 8, window.innerHeight - 200);
  return createPortal(
    <div className="fixed inset-0 z-[4500]" onClick={onClose}>
      <div
        className="absolute bg-white shadow-xl rounded-lg border p-1"
        style={{ top, left, width }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export default function TimedMealCard({
  tm,
  onRegenerate,
  onOpenMealPreview,
  onOpenCombos,
  onRemoveItem,
  onOpenAddMeal,
  loading // <-- per-card loading prop
}) {
  const chosen = tm?.choosenCombo || { meals: [] };
  const [menuOpen, setMenuOpen] = useState(false);
  const btnRef = useRef(null);

  const macroLine = useMemo(() => {
    const c = Math.round(tm.totalCalories || 0);
    const p = Math.round(tm.totalProtein || 0);
    const cb = Math.round(tm.totalCarbs || 0);
    const f = Math.round(tm.totalFat || 0);
    return `${c} kcal • P ${p} • C ${cb} • F ${f}`;
  }, [tm]);

  const anchorRect = btnRef.current?.getBoundingClientRect();

  return (
    <div className="relative rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
      {/* Loading overlay */}
      {loading && <CardLoader />}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs uppercase tracking-wide text-gray-500">{tm.type}</span>
          <p className="mt-1 text-base font-semibold text-gray-900">{tm.name}</p>
          <div className="mt-1 text-xs text-gray-600">{macroLine}</div>
        </div>

        <button
          ref={btnRef}
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-xl text-gray-500 hover:bg-gray-50"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Options"
        >
          ⋮
        </button>
      </div>

      {/* Chosen combo items */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(chosen.meals || []).map((it, idx) => {
          const mealDoc = it.meal || it.userMeal || it; // populated system or user meal
          const qty = Number(it.quantity || 0);

          return (
            <div key={`${tm._id}-chosen-${idx}`} className="relative">
              <MealCard meal={mealDoc} onClick={() => onOpenMealPreview?.(mealDoc)} compact />
              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs text-gray-700">
                  Portion: <span className="font-semibold">{formatFraction(qty)}×</span>
                </div>
                <button
                  className="text-xs rounded-md border px-2 py-1 hover:bg-gray-50"
                  onClick={() => onRemoveItem?.(tm, idx)}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}

        {(!chosen.meals || chosen.meals.length === 0) && (
          <div className="col-span-full rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-500">
            No items in this slot. Use “Add meal” to pick one from your collection.
          </div>
        )}
      </div>

      {/* Menu portal */}
      {menuOpen && (
        <MenuPortal anchorRect={anchorRect} onClose={() => setMenuOpen(false)}>
          <TimedMealMenu
            onClose={() => setMenuOpen(false)}
            onRegenerate={() => {
              setMenuOpen(false);
              onRegenerate?.(tm._id);
            }}
            onChooseOther={() => {
              setMenuOpen(false);
              onOpenCombos?.(tm);
            }}
            onOpenAddMeal={() => {
              setMenuOpen(false);
              onOpenAddMeal?.(tm);
            }}
          />
        </MenuPortal>
      )}
    </div>
  );
}
