import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MealCard from "../components/MealCard";
import axios from "axios";
import DynamicPercentageSliders from "../components/CustomizeMeal";
import Sidebar from "../components/sideBar"; // ✅ import sidebar

const MealPage = () => {
  const [mealCards, setMealCards] = useState([
    { id: 1, customLabel: "" },
    { id: 2, customLabel: "" },
    { id: 3, customLabel: "" },
  ]);
  const leftColumnRef = useRef(null);
  const [leftHeight, setLeftHeight] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/signin");

    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data);
        setFormData(res.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        localStorage.removeItem("token");
        navigate("/signin");
      }
    };

    fetchUser();
  }, [navigate]);

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);

  const addCard = () => {
    const nextId = mealCards.length
      ? mealCards[mealCards.length - 1].id + 1
      : 1;
    setMealCards([...mealCards, { id: nextId, customLabel: "" }]);
  };

  const removeCard = (id) => {
    setMealCards(mealCards.filter((meal) => meal.id !== id));
  };

  const updateCustomLabel = (id, value) => {
    setMealCards(
      mealCards.map((meal) =>
        meal.id === id ? { ...meal, customLabel: value } : meal
      )
    );
  };

  useEffect(() => {
    if (leftColumnRef.current) {
      setLeftHeight(leftColumnRef.current.offsetHeight);
    }
  }, [mealCards]);

  return (
    <div className="flex min-h-screen relative bg-gray-50">
      {/* Sidebar toggle button */}
      <button className="toggle-btn absolute top-4 left-4" onClick={toggleSidebar}>
        &#8942;
      </button>

      {/* Sidebar */}
      {userData && <Sidebar visible={sidebarVisible} userData={userData} />}

      {/* Main container */}
      <div
        className={`flex-1 flex justify-center items-start p-6 transition-all duration-300`}
        style={{
          marginLeft: sidebarVisible ? "250px" : "0px", // only shift if sidebar visible
        }}
      >
        <div
          className={`flex p-4 space-x-8 bg-gray-100 items-start w-full max-w-6xl rounded-lg shadow transition-all duration-300
          ${!sidebarVisible ? "mx-auto" : ""}`} // ✅ center horizontally if sidebar hidden
        >
          {/* Left Column */}
          <div className="flex-1 space-y-4" ref={leftColumnRef}>
            {mealCards.map((meal) => (
              <MealCard
                key={meal.id}
                customLabel={meal.customLabel}
                onCustomLabelChange={(val) => updateCustomLabel(meal.id, val)}
                onRemove={() => removeCard(meal.id)}
              />
            ))}

            {/* Buttons stacked vertically */}
            <div className="flex flex-col items-center space-y-3">
              <button
                onClick={addCard}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Meal Card
              </button>
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Save
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 max-w-md flex">
            <DynamicPercentageSliders
              mealCards={mealCards.map((meal) => meal.customLabel || "")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPage;
