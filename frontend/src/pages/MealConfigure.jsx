import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MealCard from "../components/MealCard";
import axios from "axios";
import DynamicPercentageSliders from "../components/CustomizeMeal";
import Sidebar from "../components/sideBar"; // ✅ import sidebar
import { toast } from "react-toastify"

const MealPage = () => {
  const [mealCards, setMealCards] = useState([
    { id: 1, name: "", type: "--Choose--" },
    { id: 2, name: "", type: "--Choose--" },
    { id: 3, name: "", type: "--Choose--" },
  ]);
  const leftColumnRef = useRef(null);
  const [leftHeight, setLeftHeight] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [userData, setUserData] = useState(null);
  const [mealConfig, setMealConfig] = useState([]);
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
    setMealCards([...mealCards, { id: nextId, name: "", type: "--Choose--" }]);
  };

  const removeCard = (id) => {
    setMealCards(mealCards.filter((meal) => meal.id !== id));
  };

  const updateName = (id, value) => {
    setMealCards(
      mealCards.map((meal) =>
        meal.id === id ? { ...meal, name: value } : meal
      )
    );
  };

  const updateType = (id, value) => {
    setMealCards(
      mealCards.map((meal) =>
        meal.id === id ? { ...meal, type: value } : meal
      )
    );
  };

  useEffect(() => {
    if (leftColumnRef.current) {
      setLeftHeight(leftColumnRef.current.offsetHeight);
    }
  }, [mealCards]);

  const handleMealConfigUpdate = (config) => {
    setMealConfig(config);
    // now you can use it for submit or other logic
    console.log("Received from child:", config);
  };

  {/*const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:4000/api/users/me/updateMealPlanSetting",
        { timedMealConfig: mealConfig }, // body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Meal configuration updated successfully!");
      toast.success("Meal configuration updated successfully!");
    } catch (err) {
      console.error(
        "Error updating meal config:",
        err.response?.data || err.message
      );
    }
  };*/}

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

      {/* Main container */}
      <div
        className={`flex-1 flex justify-center items-start p-6 transition-all duration-300`}
        style={{
          marginLeft: sidebarVisible ? "250px" : "0px", // only shift if sidebar visible
        }}
      >
        <div
          className={`flex flex-col p-4 bg-gray-100 w-full max-w-6xl rounded-lg shadow transition-all duration-300
  ${!sidebarVisible ? "mx-auto" : ""}`} // parent container
        >
          {/* Row: left and right columns side by side */}
          <div className="flex space-x-8 w-full items-start">
            {/* Left Column */}
            <div className="flex-1 space-y-4" ref={leftColumnRef}>
              {mealCards.map((meal) => (
                <MealCard
                  key={meal.id}
                  name={meal.name}
                  type={meal.type}
                  onNameChange={(val) => updateName(meal.id, val)}
                  onTypeChange={(val) => updateType(meal.id, val)}
                  onRemove={() => removeCard(meal.id)}
                />
              ))}

              {/* Add Meal Card Button */}
              <div className="flex flex-col items-center space-y-3 mt-4">
                <button
                  onClick={addCard}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Meal Card
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex-1 max-w-md flex">
              <DynamicPercentageSliders
                mealCards={mealCards}
                onMealConfigChange={handleMealConfigUpdate}
              />
            </div>
          </div>

          {/* Save button: below the row, centered */}
          <div className="flex justify-center w-full mt-6">
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPage;
