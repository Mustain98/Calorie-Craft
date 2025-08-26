// src/pages/MealPlanSetting.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MealCard from "../components/TimedMealConfig";
import DynamicPercentageSliders from "../components/timedMealSetting";
import Sidebar from "../components/sideBar";
import { toast } from "react-toastify";

const API_BASE = "http://localhost:4000/api";

const MealPlanSetting = () => {
  // Left column cards: label (name), type, order
  const [mealCards, setMealCards] = useState([
    { id: 1, name: "null", type: "null", order: 0 },
    { id: 2, name: "null", type: "null", order: 1 },
    { id: 3, name: "null", type: "null", order: 2 },
  ]);

  // Right column sliders: client stores percentages (0..100)
  const [slidersByPortion, setSlidersByPortion] = useState({
    caloriePortion: [null, null, null],
    carbPortion: [null, null, null],
    proteinPortion: [null, null, null],
    fatPortion: [null, null, null],
  });

  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [userData, setUserData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const leftColumnRef = useRef(null);
  const navigate = useNavigate();

  // --- load user + existing meal plan setting
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    const headers = { Authorization: `Bearer ${token}` };

    (async () => {
      try {
        // current user
        const me = await axios.get(`${API_BASE}/users/me`, { headers });
        setUserData(me.data);

        // timed meal configuration
        const conf = await axios.get(
          `${API_BASE}/users/me/myMealPlanSetting`,
          { headers }
        );

        const arr = Array.isArray(conf.data?.timedMealConfiguration)
          ? conf.data.timedMealConfiguration
          : [];

        if (!arr.length) {
          console.warn("[myMealPlanSetting] No config found, using defaults");
          return;
        }

        // normalize order + cards
        const sorted = [...arr].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0)
        );
        const nextCards = sorted.map((x, i) => ({
          id: i + 1,
          name: x.name ?? `Meal ${i + 1}`,
          type: x.type ?? "",
          order: x.order ?? i,
        }));
        setMealCards(nextCards);

        // decimals → percentages
        const toPct = (v) =>
          Math.round((Number(v || 0) * 100 + Number.EPSILON) * 100) / 100;

        setSlidersByPortion({
          caloriePortion: sorted.map((x) => toPct(x.caloriePortion)),
          carbPortion: sorted.map((x) => toPct(x.carbPortion)),
          proteinPortion: sorted.map((x) => toPct(x.proteinPortion)),
          fatPortion: sorted.map((x) => toPct(x.fatPortion)),
        });
      } catch (err) {
        console.error("Failed to fetch meal plan:", err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    })();
  }, [navigate]);

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);

  const addCard = () => {
    const nextId = mealCards.length ? mealCards[mealCards.length - 1].id + 1 : 1;
    const nextOrder = mealCards.length;
    const nextCards = [
      ...mealCards,
      { id: nextId, name: "", type: "", order: nextOrder },
    ];
    setMealCards(nextCards);

    setSlidersByPortion((prev) => {
      const expand = (arr = []) => [...arr, 0];
      return {
        caloriePortion: expand(prev.caloriePortion),
        carbPortion: expand(prev.carbPortion),
        proteinPortion: expand(prev.proteinPortion),
        fatPortion: expand(prev.fatPortion),
      };
    });
  };

  const removeCard = (id) => {
    const idx = mealCards.findIndex((m) => m.id === id);
    if (idx === -1) return;

    const next = mealCards
      .filter((m) => m.id !== id)
      .map((m, i) => ({ ...m, order: i }));
    setMealCards(next);

    setSlidersByPortion((prev) => {
      const dropAt = (arr = []) => arr.filter((_, i) => i !== idx);
      return {
        caloriePortion: dropAt(prev.caloriePortion),
        carbPortion: dropAt(prev.carbPortion),
        proteinPortion: dropAt(prev.proteinPortion),
        fatPortion: dropAt(prev.fatPortion),
      };
    });
  };

  const updateName = (id, value) => {
    setMealCards((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name: value } : m))
    );
  };

  const updateType = (id, value) => {
    setMealCards((prev) =>
      prev.map((m) => (m.id === id ? { ...m, type: value } : m))
    );
  };

  // --- Save to backend: PUT /users/me/updateMealPlanSetting
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    setSaving(true);

    // convert percent → decimal
    const pct = (key) => slidersByPortion[key] || [];
    const toDec = (x) => Number(((x ?? 0) / 100).toFixed(4));

    const payloadArray = [...mealCards]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((m, idx) => ({
        name: (m.name ?? "").trim() || `Meal ${idx + 1}`,
        type: (m.type ?? "").trim(),
        caloriePortion: toDec(pct("caloriePortion")[idx]),
        carbPortion: toDec(pct("carbPortion")[idx]),
        proteinPortion: toDec(pct("proteinPortion")[idx]),
        fatPortion: toDec(pct("fatPortion")[idx]),
        order: idx,
      }));

    const body = { timedMealConfig: payloadArray };

    try {
      await axios.put(
        `${API_BASE}/users/me/updateMealPlanSetting`,
        body,
        { headers }
      );
      toast.success("Meal plan setting saved");
    } catch (err) {
      if (err.response) {
        console.error(
          "Save failed (server):",
          err.response.status,
          err.response.data
        );
        toast.error(
          err.response?.data?.message ||
            `Save failed (${err.response.status})`
        );
        if (err.response.status === 401) navigate("/login");
      } else if (err.request) {
        console.error("Save failed (network/CORS):", err.request);
        toast.error("Network/CORS error. Check server.");
      } else {
        console.error("Save failed (setup):", err.message);
        toast.error("Client setup error. See console.");
      }
    } finally {
      setSaving(false);
    }
  };

  // --- Generate week plan then navigate to /mealplan
  // Backend route assumed: POST /api/weekplans  (adjust if you mounted differently)
  const handleGenerate = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    setGenerating(true);
    try {
      await axios.post(`${API_BASE}/weekplans`, {}, { headers });
      toast.success("Week plan generated");
      navigate("/mealplan");
    } catch (err) {
      if (err.response) {
        console.error(
          "Generate failed (server):",
          err.response.status,
          err.response.data
        );
        toast.error(
          err.response?.data?.message ||
            `Generate failed (${err.response.status})`
        );
        if (err.response.status === 401) navigate("/login");
      } else if (err.request) {
        console.error("Generate failed (network/CORS):", err.request);
        toast.error("Network/CORS error. Check server.");
      } else {
        console.error("Generate failed (setup):", err.message);
        toast.error("Client setup error. See console.");
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex min-h-screen relative bg-gray-50">
      {/* Sidebar toggle button */}
      <button
        className="toggle-btn absolute top-4 left-4"
        onClick={toggleSidebar}
      >
        &#8942;
      </button>

      {/* Sidebar */}
      {userData && <Sidebar visible={sidebarVisible} userData={userData} />}

      {/* Main content */}
      <div
        className="flex-1 flex justify-center items-start p-6 transition-all duration-300"
        style={{ marginLeft: sidebarVisible ? "250px" : "0px" }}
      >
        <div
          className={`flex p-4 space-x-8 bg-gray-100 items-start w-full max-w-6xl rounded-lg shadow transition-all duration-300 ${
            !sidebarVisible ? "mx-auto" : ""
          }`}
        >
          {/* Left Column: Cards */}
          <div className="flex-1 space-y-4" ref={leftColumnRef}>
            {mealCards.map((meal) => (
              <MealCard
                key={meal.id}
                customLabel={meal.name ?? ""}
                type={meal.type ?? ""}
                onCustomLabelChange={(val) => updateName(meal.id, val)}
                onTypeChange={(val) => updateType(meal.id, val)}
                onRemove={() => removeCard(meal.id)}
              />
            ))}

            <div className="flex flex-col items-center space-y-3">
              <button
                onClick={addCard}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Meal Card
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`px-6 py-2 rounded-lg text-white ${
                    saving ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {saving ? "Saving..." : "Save"}
                </button>

                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className={`px-6 py-2 rounded-lg text-white ${
                    generating
                      ? "bg-indigo-400"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                  title="Generate a 7-day plan from your settings"
                >
                  {generating ? "Generating..." : "Generate Week Plan"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Sliders */}
          <div className="flex-1 max-w-md flex">
            <DynamicPercentageSliders
              mealCards={mealCards.map((m) => m.name || "")}
              slidersByPortion={slidersByPortion}
              onChange={setSlidersByPortion}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlanSetting;
