// Imports
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/sideBar";
import MealModal from "../components/MealModal";
import ShowMeal from "../components/ShowMeal";
import { toast } from "react-toastify";

export default function ShowAllMeal() {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("my");
  const [allMeals, setAllMeals] = useState([]);
  const [userData, setUserData] = useState(null);
  const [userMeals, setUserMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const tab = "my,all";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/signin");

    axios
      .get("http://localhost:4000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUserData(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/signin");
      });

    axios.get("http://localhost:4000/api/meal")
      .then((res) => setAllMeals(res.data))
      .catch((err) => console.error("Failed to load meals:", err));

    axios.get("http://localhost:4000/api/users/me/myMeals", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUserMeals(res.data || []))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/signin");
      });
  }, []);

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
  const filteredMeals = activeTab === "my" ? userMeals : allMeals;

  const handleMealClick = (meal) => {
    setSelectedMeal(meal);
    setShowNutritionModal(true);
  };
  const closeNutritionModal = () => {
    setSelectedMeal(null);
    setShowNutritionModal(false);
  };

  const handleDeleteMeal = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `http://localhost:4000/api/users/me/myMeals/${selectedMeal._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserMeals((prev) => prev.filter((m) => m._id !== selectedMeal._id));
      toast.success("Meal removed from your collection");
      closeNutritionModal();
    } catch (err) {
      toast.error("Failed to delete meal");
    }
  };

  const handleSaveToMyMeals = async (meal) => {
    const token = localStorage.getItem("token");
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
      setUserMeals((prev) => [...prev, res.data.meal]);
      setSelectedMeal(res.data.meal);
      toast.success(res.data.message || "Meal saved to your collection" );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save meal");
    }
  };

  const handleShareMeal = async () => {
    const token = localStorage.getItem("token");
    try {
      const res=await axios.post(
        `http://localhost:4000/api/users/me/shareMeal/${selectedMeal._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message || "Meal shared successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to share meal");
    }
  };

  return (
    <div className="show-meal-page">
      <button className="toggle-btn" onClick={toggleSidebar}>
        &#8942;
      </button>

      {userData && (
        <Sidebar userData={userData} visible={sidebarVisible} tab={tab} />
      )}

      <ShowMeal
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filteredMeals={filteredMeals}
        sidebarVisible={sidebarVisible}
        handleMealClick={handleMealClick}
        tab={tab}
      />

      {showNutritionModal && selectedMeal && (
        <MealModal
          selectedMeal={selectedMeal}
          closeNutritionModal={closeNutritionModal}
          handleDeleteMeal={handleDeleteMeal}
          handleSaveToMyMeals={handleSaveToMyMeals}
          handleShareMeal={handleShareMeal}
          activeTab={activeTab}
        />
      )}
    </div>
  );
}
