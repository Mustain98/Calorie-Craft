import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import MealModal from "../components/MealModal";
import ShowMeal from "../components/ShowMeal";

export default function AdminShowMeals() {
  const [allMeals, setAllMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
  const [activeTab, setActiveTab] = useState("system"); // 'system' or 'pending'
  const [adminData, setAdminData] = useState({});
  const [pendingMeals, setPendingMeals] = useState([]);
  const navigate = useNavigate();
  const tab = "pending,system";
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/adminsignin");

    axios
      .get("http://localhost:5001/api/admin/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAdminData(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/adminsignin");
      });
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5001/api/admin/pending-meals", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPendingMeals(res.data))
      .catch((err) => console.error("Failed to fetch pending meals", err));

    axios
      .get("http://localhost:5001/api/meal")
      .then((res) => setAllMeals(res.data))
      .catch((err) => console.error("Failed to load meals:", err));
  }, [activeTab]);

  const handleMealClick = (meal) => {
    setSelectedMeal(meal);
    setShowNutritionModal(true);
  };

  const closeNutritionModal = () => {
    setShowNutritionModal(false);
    setSelectedMeal(null);
  };

  const filteredMeals = activeTab === "pending" ? pendingMeals : allMeals;
  const handleDeleteMeal = async () => {
    const token = localStorage.getItem("token");
    try {
      if (activeTab == "pending") {
        await axios.delete(
          `http://localhost:5001/api/admin/pending-meals/${selectedMeal._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Remove from state
        setPendingMeals(
          pendingMeals.filter((meal) => meal._id !== selectedMeal._id)
        );

        // Close modal
        closeNutritionModal();
      } else {
        await axios.delete(
          `http://localhost:5001/api/admin/meal/${selectedMeal._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAllMeals((prev) =>
          prev.filter((meal) => meal._id !== selectedMeal._id)
        );
        closeNutritionModal();
      }
    } catch (err) {
      console.error("Error deleting pending meal:", err);
      alert("Failed to delete pending meal");
    }
  };
  const handleSaveToSystem = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `http://localhost:5001/api/admin/pending-meals/${selectedMeal._id}`,
        {}, // empty body
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Remove from pendingMeals
      setPendingMeals((prev) =>
        prev.filter((meal) => meal._id !== selectedMeal._id)
      );
      closeNutritionModal();
      alert("Meal saved to system successfully");
    } catch (err) {
      console.error("Failed to save meal to system:", err);
      alert("Failed to save meal to system");
    }
  };

  return (
    <div className="show-meal-page">
      <button className="toggle-btn" onClick={toggleSidebar}>
        &#8942;
      </button>
      {sidebarVisible && (
        <AdminSidebar visible={sidebarVisible} AdminData={adminData} />
      )}

      <ShowMeal
        activeTab={activeTab}
        sidebarVisible={sidebarVisible}
        setActiveTab={setActiveTab}
        filteredMeals={filteredMeals}
        handleMealClick={handleMealClick}
        tab={tab}
      />
      {/* Nutrition Modal */}
      {showNutritionModal && selectedMeal && (
        <>
          <MealModal
            selectedMeal={selectedMeal}
            closeNutritionModal={closeNutritionModal}
            handleSaveToSystem={handleSaveToSystem}
            handleDeleteMeal={handleDeleteMeal}
            activeTab={activeTab}
          />
        </>
      )}
    </div>
  );
}
