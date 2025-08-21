import React, { useMemo, useState } from "react";

const CATEGORIES = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "main dish",
  "side dish",
  "dessert",
  "drink",
];

const ShowMeal = ({
  activeTab,
  setActiveTab,
  filteredMeals,
  handleMealClick,
  sidebarVisible,
  tab,
}) => {
  // local UI state used only when activeTab === 'all'
  const [search, setSearch] = useState("");
  const [selectedCats, setSelectedCats] = useState([]);

  const toggleCat = (cat) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCats([]);
  };

  // derive the meals to show
  const displayMeals = useMemo(() => {
    if (activeTab !== "all") return filteredMeals;

    const s = search.trim().toLowerCase();
    const hasSearch = s.length > 0;
    const hasCats = selectedCats.length > 0;

    return filteredMeals.filter((meal) => {
      const nameOk = hasSearch
        ? (meal.name || "").toLowerCase().includes(s)
        : true;

      const cats = Array.isArray(meal.categories) ? meal.categories : [];
      const catOk = hasCats ? cats.some((c) => selectedCats.includes((c || "").toLowerCase())) : true;

      return nameOk && catOk;
    });
  }, [filteredMeals, activeTab, search, selectedCats]);

  const renderTopControls = () => {
  const tabs = tab.split(",").map((t) => t.trim());
  return (
    <div className="relative z-10 mt-20 mb-8 flex items-center justify-between gap-4">
      {/* tabs */}
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

      {/* search + category filters only for ALL or SYSTEM tab */}
      {(activeTab === "all" || activeTab === "system") && (
        <div className="flex items-center gap-3">
          {/* search box */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search meals by name..."
            className="w-64 border rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
          />
          {/* clear button */}
          {(search || selectedCats.length > 0) && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm rounded-md border hover:bg-gray-50"
            >
              Clear
            </button>
          )}
          {/* category dropdown or chips */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active = selectedCats.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => toggleCat(c)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition ${
                    active
                      ? "bg-lime-500 text-white border-lime-500"
                      : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                  }`}
                  type="button"
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      )}
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
            {displayMeals.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 text-lg p-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                {activeTab === "my"
                  ? "No saved meals yet"
                  : "No meals match your filters"}
              </div>
            ) : (
              displayMeals.map((meal) => (
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

                    {/* categories badges if present */}
                    {Array.isArray(meal.categories) && meal.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {meal.categories.map((c, i) => (
                          <span
                            key={`${meal._id}-cat-${i}`}
                            className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-sm text-gray-600 mb-3">
                      Calories: {(meal.totalCalories ?? 0).toFixed
                        ? meal.totalCalories.toFixed(2)
                        : Number(meal.totalCalories || 0).toFixed(2)}
                    </p>
                    <div className="flex justify-between text-xs text-gray-500 font-medium">
                      <span>
                        Protein: {(meal.totalProtein ?? 0).toFixed
                          ? meal.totalProtein.toFixed(2)
                          : Number(meal.totalProtein || 0).toFixed(2)}g
                      </span>
                      <span>
                        Carbs: {(meal.totalCarbs ?? 0).toFixed
                          ? meal.totalCarbs.toFixed(2)
                          : Number(meal.totalCarbs || 0).toFixed(2)}g
                      </span>
                      <span>
                        Fat: {(meal.totalFat ?? 0).toFixed
                          ? meal.totalFat.toFixed(2)
                          : Number(meal.totalFat || 0).toFixed(2)}g
                      </span>
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
