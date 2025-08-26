// Imports
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/sideBar";
import MealModal from "../components/MealComponents/MealModal";
import ShowMeal from "../components/MealComponents/ShowMeal";
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
  const [loadingMeal, setLoadingMeal] = useState(false);
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

  const handleMealClick = async (meal) => {
    const token = localStorage.getItem("token");
    try {
      setLoadingMeal(true);

      let detail;
      if (activeTab === "all") {
        // system meal
        const { data } = await axios.get(`http://localhost:4000/api/meal/${meal._id}`);
        detail = data;
      } else if (activeTab === "my") {
        // user's embedded meal
        const { data } = await axios.get(
          `http://localhost:4000/api/users/me/myMeals/${meal._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        detail = data;
      } else {
        // fallback (other tabs, if any)
        detail = meal;
      }

      setSelectedMeal(detail);
      setShowNutritionModal(true);
    } catch (err) {
      console.error("Failed to load meal details:", err);
      toast.error("Failed to load meal details");
    } finally {
      setLoadingMeal(false);
    }
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
      description: meal.description || "",
      imageUrl: meal.imageUrl || meal.image || "",
      imageId: meal.imageId || null,
      categories: Array.isArray(meal.categories) ? meal.categories : [],
      macroCategory: meal.macroCategory || null,
      portionSize: meal.portionSize ?? 0,
      totalCalories: meal.totalCalories ?? 0,
      totalProtein:  meal.totalProtein  ?? 0,
      totalCarbs:    meal.totalCarbs    ?? 0,
      totalFat:      meal.totalFat      ?? 0,
      foodItems: (meal.foodItems || []).map((item) => ({
        food: (typeof item.food === "object" ? item.food._id : item.food),
        quantity: Number(item.quantity || 1),
      })),
    };

    const res = await axios.post(
      "http://localhost:4000/api/users/me/myMeals",
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setUserMeals((prev) => [...prev, res.data.meal]);
    setSelectedMeal(res.data.meal);
    toast.success(res.data.message || "Meal saved to your collection");
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to save meal");
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
            tab="my,all"
            baseUrl="http://localhost:4000/api"
            authToken={localStorage.getItem("token")}
            filterTabs={["all"]}
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
