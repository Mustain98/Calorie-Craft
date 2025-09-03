// src/pages/MealPlanSetting.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import MealCard from "../components/TimedMealConfig";
import DynamicPercentageSliders from "../components/timedMealSetting";
import Sidebar from "../components/sideBar";
import { toast } from "react-toastify";

const API_BASE = `${process.env.REACT_APP_API_BASE_URL}/api`;

const MealPlanSetting = () => {
  const [mealCards, setMealCards] = useState([
    { id: 1, name: "null", type: "null", order: 0 },
    { id: 2, name: "null", type: "null", order: 1 },
    { id: 3, name: "null", type: "null", order: 2 },
  ]);

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
    if (!token) return navigate("/signin");
    const headers = { Authorization: `Bearer ${token}` };

    (async () => {
      try {
        const me = await axios.get(`${API_BASE}/users/me`, { headers });
        setUserData(me.data);

        const conf = await axios.get(`${API_BASE}/users/me/myMealPlanSetting`, {
          headers,
        });
        const arr = Array.isArray(conf.data?.timedMealConfiguration)
          ? conf.data.timedMealConfiguration
          : [];

        if (!arr.length) return;

        const sorted = [...arr].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        const nextCards = sorted.map((x, i) => ({
          id: i + 1,
          name: x.name ?? `Meal ${i + 1}`,
          type: x.type ?? "",
          order: x.order ?? i,
        }));
        setMealCards(nextCards);

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
        navigate("/signin");
      }
    })();
  }, [navigate]);

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);

  const addCard = () => {
    const nextId = mealCards.length
      ? mealCards[mealCards.length - 1].id + 1
      : 1;
    const nextOrder = mealCards.length;
    setMealCards([
      ...mealCards,
      { id: nextId, name: "", type: "", order: nextOrder },
    ]);
    setSlidersByPortion((prev) => ({
      caloriePortion: [...prev.caloriePortion, 0],
      carbPortion: [...prev.carbPortion, 0],
      proteinPortion: [...prev.proteinPortion, 0],
      fatPortion: [...prev.fatPortion, 0],
    }));
  };

  const removeCard = (id) => {
    const idx = mealCards.findIndex((m) => m.id === id);
    if (idx === -1) return;

    const next = mealCards
      .filter((m) => m.id !== id)
      .map((m, i) => ({ ...m, order: i }));
    setMealCards(next);

    setSlidersByPortion((prev) => ({
      caloriePortion: prev.caloriePortion.filter((_, i) => i !== idx),
      carbPortion: prev.carbPortion.filter((_, i) => i !== idx),
      proteinPortion: prev.proteinPortion.filter((_, i) => i !== idx),
      fatPortion: prev.fatPortion.filter((_, i) => i !== idx),
    }));
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

  // --- handle drag end
  const onDragEnd = (result) => {
  const { source, destination } = result;
  if (!destination) return;

  const items = Array.from(mealCards);
  const [reorderedItem] = items.splice(source.index, 1);
  items.splice(destination.index, 0, reorderedItem);

  const reorderedCards = items.map((m, i) => ({ ...m, order: i }));
  setMealCards(reorderedCards);

  // Reorder slidersByPortion to match new mealCards order
  const newSliders = {};
  Object.keys(slidersByPortion).forEach((key) => {
    const arr = slidersByPortion[key];
    const reorderedArr = reorderedCards.map((m) => {
      const oldIndex = mealCards.findIndex((c) => c.id === m.id);
      return arr[oldIndex];
    });
    newSliders[key] = reorderedArr;
  });
  setSlidersByPortion(newSliders);
};


  // --- Save meal plan to backend
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/signin");

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    setSaving(true);

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
      await axios.put(`${API_BASE}/users/me/updateMealPlanSetting`, body, {
        headers,
      });
      toast.success("Meal plan setting saved");
    } catch (err) {
      if (err.response) {
        toast.error(
          err.response?.data?.message || `Save failed (${err.response.status})`
        );
        if (err.response.status === 401) navigate("/signin");
      } else {
        toast.error("Save failed. Check console.");
      }
    } finally {
      setSaving(false);
    }
  };

    // --- Reset meal plan to default
  const handleReset = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/signin");

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
       const res = await axios.put(
        `${API_BASE}/users/me/resetMealPlanSetting`,
        {},
        { headers }
       );
    

      const arr = Array.isArray(res.data?.timedMealConfiguration)
        ? res.data.timedMealConfiguration
        : [];

      if (arr.length) {
        const sorted = [...arr].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setMealCards(
          sorted.map((x, i) => ({
            id: i + 1,
            name: x.name ?? `Meal ${i + 1}`,
            type: x.type ?? "",
            order: x.order ?? i,
          }))
        );

        const toPct = (v) =>
          Math.round((Number(v || 0) * 100 + Number.EPSILON) * 100) / 100;
        setSlidersByPortion({
          caloriePortion: sorted.map((x) => toPct(x.caloriePortion)),
          carbPortion: sorted.map((x) => toPct(x.carbPortion)),
          proteinPortion: sorted.map((x) => toPct(x.proteinPortion)),
          fatPortion: sorted.map((x) => toPct(x.fatPortion)),
        });
      }

      toast.success("Meal plan reset to default");
    } catch (err) {
      if (err.response) {
        toast.error(
          err.response?.data?.error ||
            `Reset failed (${err.response.status})`
        );
        if (err.response.status === 401) navigate("/signin");
      } else {
        toast.error("Reset failed. Check console.");
      }
    }
  };

  // --- Generate week plan then navigate to /mealplan
  const handleGenerate = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/signin");

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
        toast.error(
          err.response?.data?.message || `Generate failed (${err.response.status})`
        );
        if (err.response.status === 401) navigate("/signin");
      } else {
        toast.error("Network/CORS error. Check server.");
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex min-h-screen relative bg-gray-50">
      {/* Sidebar toggle */}
      <button
        className="toggle-btn absolute top-4 left-4"
        onClick={toggleSidebar}
      >
        &#8942;
      </button>

      {userData && <Sidebar visible={sidebarVisible} userData={userData} />}

      <div
        className="flex-1 flex justify-center items-start p-6 transition-all duration-300"
        style={{ marginLeft: sidebarVisible ? "250px" : "0px" }}
      >
        <div
          className={`flex p-4 space-x-8 bg-gray-100 items-start w-full max-w-6xl rounded-lg shadow transition-all duration-300 ${
            !sidebarVisible ? "mx-auto" : ""
          }`}
        >
          {/* Left Column */}
          <div className="flex-1 space-y-4" ref={leftColumnRef}>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="mealCardsDroppable">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {mealCards.map((meal, index) => (
                      <Draggable
                        key={meal.id}
                        draggableId={meal.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-2 transition-all ${
                              snapshot.isDragging
                                ? "scale-105 shadow-lg z-50"
                                : ""
                            }`}
                          >
                            <MealCard
                              key={meal.id}
                              customLabel={meal.name ?? ""}
                              type={meal.type ?? ""}
                              onCustomLabelChange={(val) =>
                                updateName(meal.id, val)
                              }
                              onTypeChange={(val) => updateType(meal.id, val)}
                              onRemove={() => removeCard(meal.id)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {/* Add / Save / Generate Buttons */}
           
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={addCard}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Meal Card
              </button>

              {/* Row 1: Save + Reset side by side */}
              <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`px-6 py-2 rounded-lg text-white transition ${
                    saving ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                  }`}
                  aria-label="Save meal plan"
                  title="Save meal plan"
                >
                  {saving ? "Saving..." : "Save"}
                </button>

                <button
                  onClick={handleReset}
                  className="px-6 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition"
                  aria-label="Reset to default meal plan"
                  title="Revert back to default meal plan settings"
                >
                  Reset to Default
                </button>
              </div>

              {/* Row 2: Generate below */}
              <div className="w-full flex justify-center">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className={`px-6 py-2 rounded-lg text-white transition ${
                    generating ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                  title="Generate a 7-day plan from your settings"
                >
                  {generating ? "Generating..." : "Generate Week Plan"}
                </button>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="flex-1 max-w-md flex">
            <DynamicPercentageSliders
              mealCards={mealCards}
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
