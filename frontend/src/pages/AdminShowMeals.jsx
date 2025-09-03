// Imports
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";
import MealModal from "../components/MealComponents/MealModal";
import ShowMeal from "../components/MealComponents/ShowMeal";
import { toast } from "react-toastify";

export default function AdminShowMeals() {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("system");
  const [allMeals, setAllMeals] = useState([]);
  const [pendingMeals, setPendingMeals] = useState([]);
  const [adminData, setAdminData] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [isDeleting, setisDeleting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // const tab = "pending,system";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/adminsignin");

    axios
      .get(`${process.env.REACT_APP_API_ADMIN_URL}/api/admin/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAdminData(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/adminsignin");
      });

    axios
      .get(`${process.env.REACT_APP_API_ADMIN_URL}/api/admin/pending-meals`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPendingMeals(res.data))
      .catch((err) => console.error("Failed to fetch pending meals", err));

    axios
      .get(`${process.env.REACT_APP_API_ADMIN_URL}/api/meal`)
      .then((res) => setAllMeals(res.data))
      .catch((err) => console.error("Failed to load meals:", err));
  }, []);

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);

  const filteredMeals = activeTab === "pending" ? pendingMeals : allMeals;

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
    const url =
      activeTab === "pending"
        ? `${process.env.REACT_APP_API_ADMIN_URL}/api/admin/pending-meals/${selectedMeal._id}`
        : `${process.env.REACT_APP_API_ADMIN_URL}/api/admin/meal/${selectedMeal._id}`;

    try {
      setisDeleting(true);
      const res = await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (activeTab === "pending") {
        setPendingMeals((prev) =>
          prev.filter((meal) => meal._id !== selectedMeal._id)
        );
      } else {
        setAllMeals((prev) =>
          prev.filter((meal) => meal._id !== selectedMeal._id)
        );
      }
      console.log("Meal deleted successfully:", res.data);
      toast.success(res.data.message || "Meal deleted successfully");
      closeNutritionModal();
    } catch (err) {
      console.error("Error deleting meal:", err);
      toast.error(err.response?.data?.message || "Failed to delete meal");
    }finally{
      setisDeleting(false);
    }
  };

  const handleSaveToSystem = async () => {
    const token = localStorage.getItem("token");
    try {
      setIsSaving(true);
      const res = await axios.post(
        `${process.env.REACT_APP_API_ADMIN_URL}/api/admin/pending-meals/${selectedMeal._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPendingMeals((prev) =>
        prev.filter((meal) => meal._id !== selectedMeal._id)
      );
      console.log("Meal saved to system:", res.data);
      toast.success(res.data.message || "Meal saved to system");
      closeNutritionModal();
    } catch (err) {
      console.error("Failed to save meal to system:", err);
      toast.error(
        err.response?.data?.message || "Failed to save meal to system"
      );
    }finally{
      setIsSaving(false);
    }
  };

  return (
    <div className="show-meal-page">
      <button className="toggle-btn" onClick={toggleSidebar}>
        &#8942;
      </button>

      {adminData && (
        <AdminSidebar visible={sidebarVisible} AdminData={adminData} />
      )}

      <ShowMeal
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filteredMeals={filteredMeals}
        sidebarVisible={sidebarVisible}
        handleMealClick={handleMealClick}
        tab="pending,system"  
        baseUrl ={`${process.env.REACT_APP_API_ADMIN_URL}/api`}
        authToken={localStorage.getItem("token")}
        filterTabs={["system"]}
      />

      {showNutritionModal && selectedMeal && (
        <MealModal
          selectedMeal={selectedMeal}
          closeNutritionModal={closeNutritionModal}
          handleDeleteMeal={handleDeleteMeal}
          handleSaveToSystem={handleSaveToSystem}
          activeTab={activeTab}
          isDeleting={isDeleting}
          isSaving={isSaving}
          isSharing={isSharing}
        />
      )}
    </div>
  );
}
