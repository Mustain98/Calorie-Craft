import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MealCard from "../MealComponents/MealCard";
import MealModal from "../MealComponents/MealModal";
import { formatFraction } from "./utils";
import { toast } from "react-toastify";

const API_BASE = `${process.env.REACT_APP_API_BASE_URL}/api`;
const HEADERS = () => ({ Authorization: `Bearer ${localStorage.getItem("token") || ""}` });
const STEP = 0.25;

export default function AddMealModal({ tm, onClose, onAdd }) {
  const [userMeals, setUserMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewMeal, setPreviewMeal] = useState(null);
  const [picked, setPicked] = useState(null);
  const [qty, setQty] = useState(STEP);
  const [validating, setValidating] = useState(false);

  // Load user's collection
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/users/me/myMeals`, { 
          headers: HEADERS() 
        });
        setUserMeals(res.data || []);
      } catch {
        toast.error("Failed to load your meals.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const validateQty = async (meal, proposedQty) => {
    try {
      setValidating(true);
      const res = await axios.post(
        `${API_BASE}/timed-meals/${tm._id}/validate-quantity`,
        { mealId: meal._id },
        { headers: HEADERS() }
      );
      const { minQty, maxQty, step, best } = res.data || {};
      const range = {
        min: Number(minQty ?? STEP),
        max: Number(maxQty ?? STEP),
        step: Number(step ?? STEP),
      };
      const wanted = Number((proposedQty ?? range.step).toFixed(2));
      const clamped = Math.min(range.max, Math.max(range.min, wanted));
      if (wanted !== clamped) {
        toast.info(`Allowed ${range.min} – ${range.max.toFixed(2)} (step ${range.step}). Using ${clamped}.`);
      }
      setQty(clamped);
      setPicked({ meal, quantity: clamped, range, best });
      return true;
    } catch (err) {
      console.error("Validation error:", err.response?.data || err.message);
      toast.error(err?.response?.data?.error || "Validation failed. Please try again.");
      return false;
    } finally {
      setValidating(false);
    }
  };

  const onSelectMeal = (m) => setPreviewMeal(m);

  const onChooseThis = async (meal) => {
    try {
      // Handle if it's a userMeal or systemMeal
      if (!meal) {
        toast.error("No meal selected.");
        return;
      }
      // If it's a userMeal, use its _id directly
      const success = await validateQty(meal, STEP);
      if (success) {
        setPreviewMeal(null);
      }
    } catch (error) {
      toast.error("Failed to select meal. Please try again.");
    }
  };

  const inc = async (dir) => {
    if (!picked?.range) return;
    const next = Number((qty + dir * (picked.range.step || STEP)).toFixed(2));
    await validateQty(picked.meal, next);
  };

  const submitAdd = async () => {
    if (!picked?.meal) return;
    try {
      await onAdd?.(tm._id, picked.meal._id, qty);
      onClose?.();
    } catch (error) {
      toast.error("Failed to add meal. Please try again.");
    }
  };

  const headerNote = useMemo(() => "Add a meal from your collection to this slot", []);

  return (
    <div className="fixed inset-0 z-[4300] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="relative max-h-[90vh] w-full max-w-6xl overflow-auto rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">Add Meal</div>
            <h3 className="text-base font-semibold text-gray-900">
              {tm.name} — {tm.type}
            </h3>
            <p className="text-xs text-gray-500">{headerNote}</p>
          </div>
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Step 1: pick from user meals */}
        <div className="mt-5">
          <div className="mb-2 text-sm font-medium text-gray-800">Your collection</div>
          {loading ? (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
              Loading…
            </div>
          ) : userMeals.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
              You don't have any saved meals yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {userMeals.map((m) => (
                <div key={m._id}>
                  <MealCard meal={m} compact onClick={() => onSelectMeal(m)} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: quantity controls (shown after choose) */}
        {picked?.meal && (
          <div className="mt-6 rounded-xl border border-gray-200 p-4">
            <div className="text-sm font-semibold text-green-600 mb-2">
              ✓ Selected: {picked.meal.name}
            </div>
            <div className="mb-2 text-sm font-semibold text-gray-800">Portion factor</div>
            <div className="flex items-center gap-3">
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-lg text-gray-700 hover:bg-gray-50"
                onClick={() => inc(-1)}
                disabled={validating}
              >
                –
              </button>
              <div className="min-w-[80px] text-center text-lg font-semibold">
                {formatFraction(qty)}×
              </div>
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-lg text-gray-700 hover:bg-gray-50"
                onClick={() => inc(+1)}
                disabled={validating}
              >
                +
              </button>

              <div className="ml-4 text-xs text-gray-500">
                Allowed {picked.range?.min} – {Number(picked.range?.max || 0).toFixed(2)} (step {picked.range?.step})
              </div>
            </div>

            <div className="mt-4">
              <button
                className="rounded-md bg-lime-500 px-4 py-2 text-sm font-medium text-white hover:bg-lime-600 disabled:opacity-50"
                onClick={submitAdd}
                disabled={validating}
              >
                {validating ? "Adding..." : "Submit Add"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Read-only meal details */}
      {previewMeal && (
        <div className="fixed inset-0 z-[5000]">
          <MealModal
            selectedMeal={previewMeal}
            closeNutritionModal={() => setPreviewMeal(null)}
            activeTab="view"
          />
        </div>
      )}

      {/* Floating choose button */}
      {previewMeal && !picked && (
        <div className="fixed right-6 bottom-6 z-[6000]">
          <button
            className="rounded-md bg-lime-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-lime-700 disabled:opacity-50"
            onClick={(e) => {
              e.stopPropagation();
              onChooseThis(previewMeal);
            }}
            disabled={validating}
          >
            {validating ? "Validating..." : "Choose this"}
          </button>
        </div>
      )}
    </div>
  );
}
