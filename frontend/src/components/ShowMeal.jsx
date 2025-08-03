import React from "react";
import "../pages/ShowAllMeal.css";
import Sidebar from "./sideBar";

const ShowMeal = ({
  activeTab,
  setActiveTab,
  filteredMeals,
  handleMealClick,
  sidebarVisible,
  tab,
}) => {
  return (
    <main
      className={`show-meal-content ${!sidebarVisible ? "sidebar-hidden" : ""}`}
    >
      {tab == "my,system" && (
        <div className="top-controls">
          <div className="meal-toggle">
            <button
              className={activeTab === "my" ? "active" : "inactive"}
              onClick={() => setActiveTab("my")}
            >
              My Collection
            </button>
            <button
              className={activeTab === "all" ? "active" : "inactive"}
              onClick={() => setActiveTab("all")}
            >
              Meal Collection
            </button>
          </div>
        </div>
      )}

      {tab == "pending,system" && (
        <div className="top-controls">
          <div className="meal-toggle">
            <button
              className={activeTab === "pending" ? "active" : "inactive"}
              onClick={() => setActiveTab("pending")}
            >
              Pending Meals
            </button>
            <button
              className={activeTab === "system" ? "active" : "inactive"}
              onClick={() => setActiveTab("system")}
            >
              System Collection
            </button>
          </div>
        </div>
      )}

      <div className="meal-container">
        <div className="meal-list-card">
          <div className="meal-list">
            {filteredMeals.length === 0 ? (
              <div className="empty-state">
                {activeTab === "my"
                  ? "No saved meals yet"
                  : "No meals available"}
              </div>
            ) : (
              filteredMeals.map((meal) => (
                <div
                  key={meal._id}
                  className="meal-card clickable"
                  onClick={() => handleMealClick(meal)}
                >
                  <img src={meal.imageUrl || meal.image} alt={meal.name} />
                  <div className="meal-card-content">
                    <h3>{meal.name}</h3>
                    <p className="calories">Calories: {meal.totalCalories}</p>
                    <div className="meal-macros">
                      <span>Protein: {meal.totalProtein}g</span>
                      <span>Carbs: {meal.totalCarbs}g</span>
                      <span>Fat: {meal.totalFat}g</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ShowMeal;
