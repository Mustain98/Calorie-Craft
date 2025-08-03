import MealModalContent from "./MealModalContent";
import "../pages/ShowAllMeal.css";

export default function MealModal({
  closeNutritionModal,
  selectedMeal,
  activeTab,
  handleDeleteMeal,
  handleSaveToMyMeals,
  handleSaveToSystem
}) {
  return (
    <div className="modal-overlay" onClick={closeNutritionModal}>
      <div className="nutrition-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={closeNutritionModal}>
          &times;
        </button>

        <div className="modal-header">
          <img
            src={selectedMeal.imageUrl || selectedMeal.image}
            alt={selectedMeal.name}
            className="modal-image"
          />
          <h2 className="modal-title">{selectedMeal.name}</h2>
        </div>

        <div
          className=""
          style={{
            padding: "0px 16px",
          }}
        >
          <MealModalContent selectedMeal={selectedMeal} />
        </div>
        {activeTab === "all" && (
            <button
              className="save-to-my-meals-btn"
              onClick={() => handleSaveToMyMeals(selectedMeal)}
            >
              Save to My Meals
            </button>
          )}

          {activeTab === "my" && (
            <button
              className="delete-meal-btn"
              onClick={() => handleDeleteMeal(selectedMeal._id)}
            >
              Delete from My Meals
            </button>
          )}
          {
            activeTab === "pending" && (
              <button
              className="save-to-my-meals-btn"
              onClick={() => handleSaveToSystem(selectedMeal._id)}
            >
              Save to System
            </button>
            )
          }
          {
            activeTab === 'system' && (
              <button
              className="delete-meal-btn"
              onClick={() => handleDeleteMeal(selectedMeal._id)}
            >
              Delete from System
            </button>
            )
          }
      </div>
    </div>
  );
}
