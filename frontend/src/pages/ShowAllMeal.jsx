// src/pages/ShowAllMeal.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/sideBar";
import MealModal from "../components/MealModal";
import ShowMeal from "../components/ShowMeal";

export default function ShowAllMeal() {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all' or 'my'
  const [allMeals, setAllMeals] = useState([]);
  const [userData, setUserData] = useState(null);
  const [userMeals, setUserMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const tab = "my,system";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }
    axios
      .get("http://localhost:4000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUserData(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/signin");
      });
    // 1. Fetch all public/shared meals
    axios
      .get("http://localhost:4000/api/meal")
      .then((res) => setAllMeals(res.data))
      .catch((err) => console.error("Failed to load meals:", err));

    // 2. Fetch current user meals (only myMeals)
    axios
      .get("http://localhost:4000/api/users/me/myMeals", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUserMeals(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to load user meals:", err);
        localStorage.removeItem("token");
        navigate("/signin");
      });
  }, [navigate]);

  const toggleSidebar = () => setSidebarVisible((v) => !v);

  const filteredMeals = activeTab === "my" ? userMeals : allMeals;

  const handleMealClick = (meal) => {
    setSelectedMeal(meal);
    setShowNutritionModal(true);
  };

  const closeNutritionModal = () => {
    setShowNutritionModal(false);
    setSelectedMeal(null);
  };

  const handleDeleteMeal = async (mealId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `http://localhost:4000/api/users/me/myMeals/${mealId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserMeals((prev) => prev.filter((meal) => meal._id !== mealId));
      closeNutritionModal();
    } catch (err) {
      console.error("Failed to delete meal:", err);
    }
  };

  // Add this function inside your component:

  const handleSaveToMyMeals = async (meal) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    try {
      const payload = {
        name: meal.name,
        imageUrl: meal.imageUrl || meal.image || "",
        foodItems: meal.foodItems.map((item) => ({
          food: typeof item.food === "object" ? item.food._id : item.food,
          quantity: item.quantity,
        })),
      };

      const res = await axios.post(
        "http://localhost:4000/api/users/me/myMeals",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newMeal = res.data.meal;

      // Update state with correct embedded meal (_id from user's myMeals)
      setUserMeals((prev) => [...prev, newMeal]);
      setSelectedMeal(newMeal); // <-- this ensures correct _id is used for deletion
      alert("Meal saved to My Meals!");
    } catch (err) {
      console.error("Failed to save meal:", err);
      alert("Failed to save meal");
    }
  };

  return (
    <div className="show-meal-page">
      <button className="toggle-btn" onClick={toggleSidebar}>
        &#8942;
      </button>

      {userData && <Sidebar userData={userData} visible={sidebarVisible} tab={tab} />}

      <ShowMeal activeTab={activeTab} setActiveTab={setActiveTab} filteredMeals={filteredMeals}  sidebarVisible={sidebarVisible} handleMealClick={handleMealClick} tab={tab} />
      {/* Nutrition Modal */}
      {showNutritionModal && selectedMeal && (
        <>
          <MealModal
            closeNutritionModal={closeNutritionModal}
            selectedMeal={selectedMeal}
            handleDeleteMeal={handleDeleteMeal}
            handleSaveToMyMeals={handleSaveToMyMeals}
            activeTab={activeTab}
          />
        </>
      )}
    </div>
  );
}
