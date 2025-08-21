import React from "react";

const ShowMeal = ({
  activeTab,
  setActiveTab,
  filteredMeals,
  handleMealClick,
  sidebarVisible,
  tab,
}) => {
  const renderTopControls = () => {
    const tabs = tab.split(",");
    return (
      <div className="relative z-10 mt-20 mb-8 flex justify-start items-center">
        <div className="flex border border-gray-300 rounded-full shadow-md overflow-hidden">
          {tabs.map((t) => (
            <button
              key={t}
              className={`px-5 py-2 text-sm font-medium transition-all duration-300 ${
                activeTab === t
                  ? "bg-lime-500 text-white font-semibold"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab(t)}
            >
              {t === "my"
                ? "My Collection"
                : t === "all"
                ? "Meal Collection"
                : t === "pending"
                ? "Pending Meals"
                : "System Collection"}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main
      className={`flex-1 transition-all duration-300 p-10 ${
        !sidebarVisible ? "ml-0" : "ml-[270px]"
      } min-h-screen bg-gray-100 font-segoe`}
    >
      {renderTopControls()}

      <div className="w-full">
        <div className="bg-white rounded-xl p-8 shadow-md min-h-[400px]">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMeals.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 text-lg p-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                {activeTab === "my"
                  ? "No saved meals yet"
                  : "No meals available"}
              </div>
            ) : (
              filteredMeals.map((meal) => (
                <div
                  key={meal._id}
                  className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition cursor-pointer"
                  onClick={() => handleMealClick(meal)}
                >
                  <img
                    src={meal.imageUrl || meal.image}
                    alt={meal.name}
                    className="w-full max-h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {meal.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Calories: {meal.totalCalories.toFixed(2)}
                    </p>
                    <div className="flex justify-between text-xs text-gray-500 font-medium">
                      <span>Protein: {meal.totalProtein.toFixed(2)}g</span>
                      <span>Carbs: {meal.totalCarbs.toFixed(2)}g</span>
                      <span>Fat: {meal.totalFat.toFixed(2)}g</span>
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
