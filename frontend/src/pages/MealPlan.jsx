import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/sideBar";

const API_BASE = "http://localhost:4000/api";
const Q_STEP = 0.25;

export default function MealPlan() {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [userData, setUserData] = useState(null);
  const [weekPlan, setWeekPlan] = useState(null);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // modal state for a specific timed meal
  const [openTimedMeal, setOpenTimedMeal] = useState(null); // the full timedMeal doc

  const weekDays = useMemo(
    () => ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
    []
  );

  const headers = () => ({
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  });

  // Load user + my current week plan
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/signin");

    (async () => {
      try {
        const me = await axios.get(`${API_BASE}/users/me`, { headers: headers() });
        setUserData(me.data);

        const wp = await axios.get(`${API_BASE}/week-plan/me`, { headers: headers() });
        setWeekPlan(wp.data?.weekPlan || wp.data); // support either {weekPlan} or raw
      } catch (err) {
        console.error("[MealPlan] fetch error:", err?.response?.data || err);
        localStorage.removeItem("token");
        navigate("/signin");
      }
    })();
  }, [navigate]);

  const toggleSidebar = () => setSidebarVisible((v) => !v);

  const dayObj = weekPlan?.days?.[activeDayIndex] || null;
  const timedMeals = dayObj?.timedMeals || [];

  // Totals for the active day — we can sum chosen combo macros or use day totals if provided
  const dayTotals = useMemo(() => {
    if (!timedMeals.length) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return timedMeals.reduce(
      (t, tm) => {
        t.calories += Number(tm.totalCalories || 0);
        t.protein  += Number(tm.totalProtein  || 0);
        t.carbs    += Number(tm.totalCarbs    || 0);
        t.fat      += Number(tm.totalFat      || 0);
        return t;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [timedMeals]);

  // --- Actions on a timed meal ---

  // swap chosen combo to an index in mealCombos
  const chooseComboIndex = async (tmId, index) => {
    try {
      const res = await axios.patch(
        `${API_BASE}/timed-meals/${tmId}`,
        { chooseIndex: index },
        { headers: headers() }
      );
      // update local state
      patchTimedMealInState(res.data);
    } catch (err) {
      console.error("[chooseComboIndex] failed:", err?.response?.data || err);
      alert("Failed to choose combo");
    }
  };

  // replace chosen combo with a custom combo object
  const replaceChosenCombo = async (tmId, combo) => {
    try {
      const res = await axios.patch(
        `${API_BASE}/timed-meals/${tmId}`,
        { choosenCombo: combo },
        { headers: headers() }
      );
      patchTimedMealInState(res.data);
    } catch (err) {
      console.error("[replaceChosenCombo] failed:", err?.response?.data || err);
      alert("Failed to update chosen combo");
    }
  };

  // add a meal to chosen combo (quantity default 0.25)
  const addMealToChosen = async (tm, mealId) => {
    const chosen = tm.choosenCombo || { meals: [], cost: 0 };
    const next = {
      ...chosen,
      meals: [...(chosen.meals || []), { meal: mealId, quantity: Q_STEP }],
    };
    await replaceChosenCombo(tm._id, next);
  };

  // increment/decrement quantity of an item in chosen combo by 0.25
  const adjQty = async (tm, itemIndex, delta) => {
    const chosen = tm.choosenCombo || { meals: [], cost: 0 };
    const items = [...(chosen.meals || [])];
    const cur = Number(items[itemIndex]?.quantity || 0);
    const nextQty = Math.max(Q_STEP, +(cur + delta).toFixed(2));
    items[itemIndex] = { ...items[itemIndex], quantity: nextQty };
    await replaceChosenCombo(tm._id, { ...chosen, meals: items });
  };

  // state helper: replace a timedMeal within weekPlan after server returns updated doc
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
    // also refresh the open modal if it's the same TM
    setOpenTimedMeal((cur) =>
      cur && String(cur._id) === String(updatedTm._id) ? updatedTm : cur
    );
  };

  // picker: get meals from user collection or system
  const fetchUserMeals = async () => {
    const res = await axios.get(`${API_BASE}/users/me/myMeals`, { headers: headers() });
    return res.data || [];
  };
  const searchSystemMeals = async (q) => {
    const res = await axios.get(`${API_BASE}/meal/search`, {
      params: { q },
    });
    return res.data || [];
  };

  return (
    <div className="meal-plan-page">
      <button className="toggle-btn" onClick={toggleSidebar}>⋮</button>
      {userData && <Sidebar visible={sidebarVisible} userData={userData} />}

      {/* Day tabs like your collection tabs */}
      <div className={`view-toggle-bar ${!sidebarVisible ? "sidebar-hidden" : ""}`}>
        {weekDays.map((d, i) => (
          <button
            key={d}
            className={i === activeDayIndex ? "active" : ""}
            onClick={() => setActiveDayIndex(i)}
          >
            {d}
          </button>
        ))}
      </div>

      <main className={`meal-plan-content ${!sidebarVisible ? "sidebar-hidden" : ""}`}>
        {!weekPlan ? (
          <div>Loading week plan…</div>
        ) : (
          <>
            {/* Daily totals */}
            <div className="nutrition-summary-row" style={{ marginBottom: 16 }}>
              <div className="nutrition-col">
                <strong>Calories</strong> {dayTotals.calories}
              </div>
              <div className="nutrition-col">
                <strong>Protein</strong> {dayTotals.protein} g
              </div>
              <div className="nutrition-col">
                <strong>Carbs</strong> {dayTotals.carbs} g
              </div>
              <div className="nutrition-col">
                <strong>Fat</strong> {dayTotals.fat} g
              </div>
            </div>

            {/* Timed meals for the day */}
            <div className="meal-grid" style={{ gridTemplateColumns: "1fr", gap: 12 }}>
              {timedMeals.map((tm) => (
                <div key={tm._id} className="meal-card clickable" onClick={() => setOpenTimedMeal(tm)}>
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <div>
                      <small>{tm.type}</small>
                      <p style={{ margin: 0, fontWeight: 600 }}>{tm.name}</p>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        {Math.round(tm.totalCalories)} kcal • P {Math.round(tm.totalProtein)} • C {Math.round(tm.totalCarbs)} • F {Math.round(tm.totalFat)}
                      </div>
                    </div>
                    <button className="options-btn" onClick={(e) => { e.stopPropagation(); setOpenTimedMeal(tm); }}>
                      ⋮
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Timed Meal modal */}
      {openTimedMeal && (
        <TimedMealModal
          tm={openTimedMeal}
          onClose={() => setOpenTimedMeal(null)}
          onChooseIndex={chooseComboIndex}
          onAddMeal={addMealToChosen}
          onAdjustQty={adjQty}
          fetchUserMeals={fetchUserMeals}
          searchSystemMeals={searchSystemMeals}
        />
      )}
    </div>
  );
}

/* -------- Modal component (inline for brevity) -------- */
function TimedMealModal({
  tm,
  onClose,
  onChooseIndex,
  onAddMeal,
  onAdjustQty,
  fetchUserMeals,
  searchSystemMeals,
}) {
  const [userMeals, setUserMeals] = useState([]);
  const [sysQuery, setSysQuery] = useState("");
  const [sysMeals, setSysMeals] = useState([]);

  useEffect(() => {
    (async () => {
      try { setUserMeals(await fetchUserMeals()); } catch {}
    })();
  }, [fetchUserMeals]);

  const searchSys = async (e) => {
    e.preventDefault();
    try { setSysMeals(await searchSystemMeals(sysQuery)); } catch {}
  };

  const chosen = tm?.choosenCombo || { meals: [] };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e)=>e.stopPropagation()}>
        <div className="modal-header">
          <button className="back-btn" onClick={onClose}>←</button>
          <h3>{tm.name} — {tm.type}</h3>
        </div>

        <div className="modal-body">
          {/* Left: chosen combo + edit */}
          <div className="modal-left">
            <div className="section-tag meals-tag">Chosen combo</div>
            <div className="meals-container">
              {(chosen.meals || []).map((it, idx) => (
                <div key={idx} className="meal-detail-card" style={{ marginBottom: 8 }}>
                  <div className="meal-detail-content">
                    <img
                      src={it.meal?.imageUrl || it.meal?.image}
                      alt={it.meal?.name}
                      className="meal-detail-image"
                    />
                    <div className="meal-detail-info">
                      <div className="meal-name">{it.meal?.name || "Meal"}</div>
                      <div className="meal-weight">
                        Qty: {Number(it.quantity || 0).toFixed(2)}x
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="options-btn" onClick={() => onAdjustQty(tm, idx, -Q_STEP)}>-</button>
                      <button className="options-btn" onClick={() => onAdjustQty(tm, idx, +Q_STEP)}>+</button>
                    </div>
                  </div>
                </div>
              ))}
              {!chosen.meals?.length && <div>No items in chosen combo.</div>}
            </div>
          </div>

          {/* Right: other combos + add from collections */}
          <div className="modal-right">
            <div className="section-tag nutrition-tag">Other combos</div>
            <div className="nutrition-container" style={{ marginBottom: 16 }}>
              {(tm.mealCombos || []).map((c, i) => (
                <div key={i} className="nutrition-item" style={{ alignItems: "center" }}>
                  <span className="nutrition-name">Combo #{i+1}</span>
                  <span className="nutrition-value">cost: {c.cost ?? 0}</span>
                  <button
                    className="more-btn"
                    style={{ width: 120, marginTop: 0 }}
                    onClick={() => onChooseIndex(tm._id, i)}
                  >
                    Choose
                  </button>
                </div>
              ))}
              {!tm.mealCombos?.length && <div>No alternative combos available.</div>}
            </div>

            <div className="section-tag nutrition-tag">Add from My Meals</div>
            <div className="nutrition-container" style={{ marginBottom: 16, maxHeight: 180, overflow: "auto" }}>
              {userMeals.map((m) => (
                <div key={m._id} className="nutrition-item" style={{ alignItems: "center" }}>
                  <span className="nutrition-name">{m.name}</span>
                  <button className="more-btn" style={{ width: 120, marginTop: 0 }}
                    onClick={() => onAddMeal(tm, m._id)}
                  >
                    Add 0.25x
                  </button>
                </div>
              ))}
              {!userMeals.length && <div>No saved meals.</div>}
            </div>

            <div className="section-tag nutrition-tag">Add from System</div>
            <form onSubmit={searchSys} className="nutrition-container" style={{ marginBottom: 8 }}>
              <input
                value={sysQuery}
                onChange={(e) => setSysQuery(e.target.value)}
                placeholder="Search system meals…"
                className="meal-input"
                style={{ width: "100%", marginBottom: 8, padding: 8, border: "1px solid #ddd", borderRadius: 8 }}
              />
              <button className="more-btn" type="submit">Search</button>
            </form>
            <div className="nutrition-container" style={{ maxHeight: 180, overflow: "auto" }}>
              {sysMeals.map((m) => (
                <div key={m._id} className="nutrition-item" style={{ alignItems: "center" }}>
                  <span className="nutrition-name">{m.name}</span>
                  <button className="more-btn" style={{ width: 120, marginTop: 0 }}
                    onClick={() => onAddMeal(tm, m._id)}
                  >
                    Add 0.25x
                  </button>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
