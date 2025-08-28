// src/pages/MealPlan.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/sideBar";
import RequirementSummary from "../components/mealplan/RequirementSummary";
import DayTabs from "../components/mealplan/DayTabs";
import TimedMealList from "../components/mealplan/TimedMealList";
import AddMealModal from "../components/mealplan/AddMealModal";
import CombosModal from "../components/mealplan/CombosModal";
import MealModal from "../components/MealComponents/MealModal";
import FullPageLoader from "../components/FullPageLoader";
import { toast } from "react-toastify";

const API_BASE = `${process.env.REACT_APP_API_BASE_URL}/api`;
const HEADERS = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

export default function MealPlan() {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [overlayLoading, setOverlayLoading] = useState(false);

  const [user, setUser] = useState(null);
  const [weekPlan, setWeekPlan] = useState(null);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [planMissing, setPlanMissing] = useState(false);

  // overlays
  const [selectedMealForPreview, setSelectedMealForPreview] = useState(null);
  const [showCombosFor, setShowCombosFor] = useState(null);
  const [showAddFor, setShowAddFor] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setPlanMissing(false);
    try {
      const me = await axios.get(`${API_BASE}/users/me`, {
        headers: HEADERS(),
      });
      setUser(me.data || null);

      const wpRes = await axios.get(`${API_BASE}/weekPlans/me`, {
        headers: HEADERS(),
      });
      const wp = wpRes.data?.weekPlan || null;

      if (!wp || !Array.isArray(wp.days) || wp.days.length === 0) {
        setPlanMissing(true);
        setWeekPlan(null);
      } else {
        setWeekPlan(wp);
        setActiveDayIndex(0);
      }
    } catch (err) {
      const code = err?.response?.status;
      if (code === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        console.error("[MealPlan] loadAll:", err?.response?.data || err);
        toast.error("Failed to load meal plan.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    loadAll();
  }, [navigate, loadAll]);

  const generatePlan = async () => {
    try {
      setOverlayLoading(true);
      await axios.post(`${API_BASE}/weekPlans`, {}, { headers: HEADERS() });
      toast.success("Generated a new 7-day plan.");
      await loadAll();
    } catch (err) {
      const code = err?.response?.status;
      if (code === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        toast.error(err?.response?.data?.error || "Failed to generate plan.");
      }
    }
  };

  const deletePlan = async () => {
    try {
      await axios.delete(`${API_BASE}/weekPlans/me`, { headers: HEADERS() });
      toast.success("Deleted your week plan.");
      await loadAll();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to delete plan.");
    }
  };

  const toggleSidebar = () => setSidebarVisible((v) => !v);

  const weekDays = useMemo(
    () => [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    []
  );

  const dayDoc = weekPlan?.days?.[activeDayIndex] || null;
  const timedMeals = Array.isArray(dayDoc?.timedMeals) ? dayDoc.timedMeals : [];

  const patchTimedMealInState = (updatedTm) => {
    setWeekPlan((prev) => {
      if (!prev?.days) return prev;
      const nextDays = prev.days.map((d) => ({
        ...d,
        timedMeals: (d.timedMeals || []).map((tm) =>
          String(tm._id) === String(updatedTm._id) ? updatedTm : tm
        ),
      }));
      return { ...prev, days: nextDays };
    });
    setShowCombosFor((cur) =>
      cur && String(cur._id) === String(updatedTm._id) ? updatedTm : cur
    );
    setShowAddFor((cur) =>
      cur &&
      cur.timedMeal &&
      String(cur.timedMeal._id) === String(updatedTm._id)
        ? { ...cur, timedMeal: updatedTm }
        : cur
    );
  };

  const chooseComboIndex = async (tmId, index) => {
    try {
      const res = await axios.put(
        `${API_BASE}/timed-meals/${tmId}/replace-chosen`,
        { otherComboIndex: index },
        { headers: HEADERS() }
      );
      patchTimedMealInState(res.data?.timedMeal || res.data);
      toast.success("Combo selected.");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to choose combo.");
    }
  };

  const handleRegenerateTimedMeal = async (tmId) => {
    try {
      const res = await axios.post(
        `${API_BASE}/weekPlans/timed-meal/${tmId}/regenerate`,
        {},
        { headers: HEADERS() }
      );
      patchTimedMealInState(res.data.timedMeal || res.data);
      toast.success("Timed meal regenerated.");
    } catch (e) {
      console.error("Regenerate failed:", e?.response?.data || e);
      toast.error("Failed to regenerate timed meal");
    }
  };

  const removeItemFromChosen = async (tm, index) => {
    try {
      const res = await axios.patch(
        `${API_BASE}/timed-meals/${tm._id}/remove-chosen-meal`,
        { itemIndex: index },
        { headers: HEADERS() }
      );
      patchTimedMealInState(res.data?.timedMeal || res.data);
      toast.success("Meal removed from slot.");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to remove meal.");
    }
  };

  const addUserMeal = async (tmId, userMealId, quantity) => {
    try {
      const res = await axios.patch(
        `${API_BASE}/timed-meals/${tmId}/add-user-meal`,
        { userMealId, quantity },
        { headers: HEADERS() }
      );
      patchTimedMealInState(res.data?.timedMeal || res.data);
      toast.success("Meal added to slot.");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to add meal.");
    }
  };

  // Ensure modal shows fully populated system meal if needed
  const openMealPreview = async (mealDoc) => {
    try {
      // if looks populated (has foodItems with embedded food), show directly
      if (Array.isArray(mealDoc?.foodItems) && mealDoc.foodItems.length > 0) {
        if (
          mealDoc.foodItems[0]?.food?.name ||
          typeof mealDoc.foodItems[0]?.food === "object"
        ) {
          setSelectedMealForPreview(mealDoc);
          return;
        }
      }
      // otherwise, fetch system meal by id if present
      if (mealDoc?._id) {
        const { data } = await axios.get(`${API_BASE}/meals/${mealDoc._id}`);
        setSelectedMealForPreview(data || mealDoc);
        return;
      }
      // fallback: show whatever we have (may be user snapshot with macros only)
      setSelectedMealForPreview(mealDoc);
    } catch {
      setSelectedMealForPreview(mealDoc);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Floating toggle */}
      <button
        className="fixed top-5 left-5 z-[4000] flex h-10 w-10 items-center justify-center rounded-full bg-lime-500 text-white shadow-md hover:bg-lime-600"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        ⋮
      </button>

      {/* Sidebar */}
      {user && <Sidebar visible={sidebarVisible} userData={user} />}

      {/* Sticky day tabs + action bar */}
      <div
        className={`sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur px-4 sm:px-6 ${
          sidebarVisible ? "ml-[270px]" : "ml-0"
        }`}
      >
        <div className="flex items-center justify-between py-3">
          <DayTabs
            days={weekDays}
            activeIndex={activeDayIndex}
            onSelect={setActiveDayIndex}
          />
          <div className="flex gap-2">
            <button
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={deletePlan}
            >
              Delete plan
            </button>
            <button
              className="rounded-lg bg-lime-500 px-3 py-2 text-sm font-medium text-white shadow hover:bg-lime-600"
              onClick={generatePlan}
            >
              Generate plan
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main
        className={`transition-all duration-300 ${
          sidebarVisible ? "ml-[270px]" : "ml-0"
        } px-4 sm:px-6 pb-12`}
      >
        {loading ? (
          <div className="flex h-[60vh] items-center justify-center text-gray-500">
            Loading…
          </div>
        ) : planMissing ? (
          <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <h3 className="text-lg font-semibold">No meal plan yet</h3>
            <p className="mt-1 text-sm text-gray-600">
              You don’t have an active 7-day plan. Generate one now, or come
              back after creating your meal plan settings.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => navigate("/mealsetting")}
              >
                Meal Plan Settings
              </button>
              <button
                className="rounded-lg bg-lime-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-lime-600"
                onClick={generatePlan}
              >
                Generate a Week Plan
              </button>
            </div>
          </div>
        ) : (
          <>
            <RequirementSummary user={user} dayDoc={dayDoc} />
            <TimedMealList
              timedMeals={timedMeals}
              onOpenMealPreview={openMealPreview}
              onOpenCombos={setShowCombosFor}
              onOpenReplace={(tm, replaceIndex = null) =>
                setShowAddFor({ timedMeal: tm, replaceIndex })
              }
              onRegenerateTimedMeal={handleRegenerateTimedMeal}
              onRemoveItem={removeItemFromChosen}
              onOpenAddMeal={(tm) => setShowAddFor({ timedMeal: tm })}
            />
          </>
        )}
      </main>

      {/* Read-only Meal Modal, forced on top */}
      {selectedMealForPreview && (
        <div className="fixed inset-0 z-[5000]">
          <MealModal
            selectedMeal={selectedMealForPreview}
            closeNutritionModal={() => setSelectedMealForPreview(null)}
            activeTab="view"
          />
        </div>
      )}

      {/* Combos modal (choose another combo) */}
      {showCombosFor && (
        <CombosModal
          tm={showCombosFor}
          onClose={() => setShowCombosFor(null)}
          onChoose={(index) => chooseComboIndex(showCombosFor._id, index)}
          onPreviewMeal={openMealPreview}
        />
      )}

      {/* add from user's collection modal */}
      {showAddFor && (
        <AddMealModal
          tm={showAddFor.timedMeal}
          onClose={() => setShowAddFor(null)}
          onAdd={addUserMeal}
        />
      )}
      <FullPageLoader visible={overlayLoading} />
    </div>
  );
}
