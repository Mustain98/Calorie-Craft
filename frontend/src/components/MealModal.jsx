import React from "react";

export default function MealModal({
  closeNutritionModal,
  selectedMeal,
  activeTab,
  handleDeleteMeal,
  handleSaveToMyMeals,
  handleShareMeal,
  isSharing,
  handleSaveToSystem,
}) {
  if (!selectedMeal) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={closeNutritionModal}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-auto p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeNutritionModal}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold"
          aria-label="Close Modal"
        >
          &times;
        </button>

        {/* Header: Image + Title */}
        <div className="flex flex-col items-center space-y-4 mb-6">
          <img
            src={selectedMeal.imageUrl || selectedMeal.image}
            alt={selectedMeal.name}
            className="w-40 h-40 rounded-lg object-cover shadow-md"
          />
          <h2 className="text-2xl font-semibold text-gray-800">{selectedMeal.name}</h2>
        </div>

        {/* Ingredients Section */}
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-3 border-b pb-1 border-gray-300">
            Ingredients
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedMeal.foodItems?.length
              ? selectedMeal.foodItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="text-gray-700 text-base border-b border-gray-100 py-1"
                  >
                    {item.quantity}× {item.food.name}
                  </div>
                ))
              : selectedMeal.ingredients?.map((ing, i) => (
                  <div
                    key={i}
                    className="text-gray-700 text-base border-b border-gray-100 py-1"
                  >
                    {ing}
                  </div>
                ))}
          </div>
        </section>

        {/* Nutrition Section */}
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-3 border-b pb-1 border-gray-300">
            Nutrition Facts
          </h3>
          <div className="grid grid-cols-2 gap-4 text-gray-700">
            <div className="flex justify-between">
              <span>Calories</span>
              <span>{selectedMeal.totalCalories.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Protein (g)</span>
              <span>{selectedMeal.totalProtein.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Carbohydrates (g)</span>
              <span>{selectedMeal.totalCarbs.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Fat (g)</span>
              <span>{selectedMeal.totalFat.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="flex flex-wrap gap-3 justify-center">
          {/* Show Save To My Meals only on 'all' tab */}
          {activeTab === "all" && (
            <button
              onClick={() => handleSaveToMyMeals(selectedMeal)}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md transition"
              type="button"
            >
              Save to My Meals
            </button>
          )}

          {/* Show Delete and Share buttons on 'my' tab */}
          {activeTab === "my" && (
            <>
              <button
                onClick={() => handleDeleteMeal(selectedMeal._id)}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md transition"
                type="button"
              >
                Delete from My Meals
              </button>
              <button
                onClick={() => handleShareMeal(selectedMeal._id)}
                disabled={isSharing}
                className={`bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition ${
                  isSharing ? "opacity-50 cursor-not-allowed" : ""
                }`}
                type="button"
              >
                {isSharing ? "Sharing..." : "Share Meal"}
              </button>
            </>
          )}

          {/* Pending tab buttons */}
          {activeTab === "pending" && (
            <>
              <button
                onClick={() => handleSaveToSystem(selectedMeal._id)}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md transition"
                type="button"
              >
                Save to System
              </button>
              <button
                onClick={() => handleDeleteMeal(selectedMeal._id)}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md transition"
                type="button"
              >
                Delete from Pending
              </button>
            </>
          )}

          {/* System tab delete only */}
          {activeTab === "system" && (
            <button
              onClick={() => handleDeleteMeal(selectedMeal._id)}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md transition"
              type="button"
            >
              Delete from System
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
