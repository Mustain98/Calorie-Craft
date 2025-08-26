// src/components/mealplan/TimedMealMenu.jsx
import React, { useEffect, useRef } from "react";

/**
 * Small menu body; the actual positioning/z-index is handled by the MenuPortal in TimedMealCard.
 * Only two items per your request: Regenerate + Choose from other combos.
 */
export default function TimedMealMenu({ onClose, onRegenerate, onChooseOther,onOpenAddMeal }) {
  const boxRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) onClose?.();
    };
    const onEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);

  return (
    <div ref={boxRef} className="w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-lg z-[4600]">
      <button
        className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50"
        onClick={() => {
          onRegenerate?.();
          onClose?.();
        }}
      >
        Regenerate this timed meal
      </button>
      <button
        className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50"
        onClick={() => {
          onChooseOther?.();
          onClose?.();
        }}
      >
        Choose from other combos
      </button>
      <button
        className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50"
        onClick={() => {
          onOpenAddMeal?.();
          onClose?.();
        }}
      >
        Add meal from your collection
      </button>
    </div>
  );
}
