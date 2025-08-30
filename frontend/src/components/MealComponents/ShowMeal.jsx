import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import MealCard from "./MealCard";
const CATEGORIES = [
  "breakfast","lunch","dinner","snack","main dish","side dish","dessert","drink",
];

// helper: intersect arrays of meals by _id
const intersectById = (a, b) => {
  const set = new Set(b.map(x => x._id));
  return a.filter(x => set.has(x._id));
};

const ShowMeal = ({
  activeTab,
  setActiveTab,
  filteredMeals,         
  handleMealClick,
  sidebarVisible,
  tab,
  baseUrl,               
  authToken,              
  filterTabs = ["all"],   
}) => {
  // local UI state (only used when activeTab ∈ filterTabs)
  const [search, setSearch] = useState("");
  const [selectedCats, setSelectedCats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverMeals, setServerMeals] = useState([]); // meals fetched from backend

  const isBackendTab = filterTabs.includes(activeTab);

  const toggleCat = (cat) =>
    setSelectedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCats([]);
  };

  // Build headers
  const headers = useMemo(() => {
    const h = {};
    if (authToken) h.Authorization = `Bearer ${authToken}`;
    return h;
  }, [authToken]);

  // axios cancel refs
  const searchReq = useRef(null);
  const catReq = useRef(null);

  // Debounced backend fetching on All/System (or whichever tabs you specify)
  useEffect(() => {
    if (!isBackendTab || !baseUrl) return;
    setLoading(true);

    // cancel in-flight
    if (searchReq.current) searchReq.current.cancel("new request");
    if (catReq.current) catReq.current.cancel("new request");

    const srcS = axios.CancelToken.source();
    const srcC = axios.CancelToken.source();
    searchReq.current = srcS;
    catReq.current = srcC;

    const hasSearch = search.trim().length > 0;
    const hasCats = selectedCats.length > 0;

    const load = async () => {
      try {
        // No filters => load all
        if (!hasSearch && !hasCats) {
          const { data } = await axios.get(`${baseUrl}/meal/`, { headers, cancelToken: srcS.token });
          setServerMeals(Array.isArray(data) ? data : (data.items || data.meals || []));
          setLoading(false);
          return;
        }

        // Only search
        if (hasSearch && !hasCats) {
          const { data } = await axios.get(`${baseUrl}/meal/search`, {
            params: { q: search.trim() }, headers, cancelToken: srcS.token
          });
          setServerMeals(Array.isArray(data) ? data : (data.items || data.meals || []));
          setLoading(false);
          return;
        }

        // Only categories
        if (!hasSearch && hasCats) {
          const { data } = await axios.get(`${baseUrl}/meal/by-categories`, {
            params: { categories: selectedCats.join(",") }, headers, cancelToken: srcC.token
          });
          const arr = Array.isArray(data) ? data : (data.items || data.meals || []);
          setServerMeals(arr);
          setLoading(false);
          return;
        }

        // Both: fetch both, then intersect by _id
        const [sRes, cRes] = await Promise.all([
          axios.get(`${baseUrl}/meals/search`, {
            params: { q: search.trim() }, headers, cancelToken: srcS.token
          }),
          axios.get(`${baseUrl}/meals/by-categories`, {
            params: { categories: selectedCats.join(",") }, headers, cancelToken: srcC.token
          }),
        ]);
        const catsArr = Array.isArray(cRes.data) ? cRes.data : (cRes.data.items || cRes.data.meals || []);
        setServerMeals(intersectById(sRes.data || [], catsArr || []));
        setLoading(false);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("Fetch meals failed:", err);
          setServerMeals([]);
          setLoading(false);
        }
      }
    };

    const t = setTimeout(load, 250); // debounce
    return () => {
      clearTimeout(t);
      srcS.cancel("cleanup");
      srcC.cancel("cleanup");
    };
  }, [isBackendTab, baseUrl, headers, search, selectedCats]);

  // decide what to render
  const displayMeals = isBackendTab ? serverMeals : filteredMeals;

  const tabs = tab.split(",").map(t => t.trim());

  return (
    <main
      className={`flex-1 transition-all duration-300 p-10 ${
        !sidebarVisible ? "ml-0" : "ml-[270px]"
      } min-h-screen bg-gray-100 font-segoe`}
    >
      {/* Top controls (tabs + filters) */}
      <div className="relative z-10 mt-20 mb-8 flex items-center justify-between gap-4">
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

        {/* search + categories only for tabs that use backend */}
        {isBackendTab && (
          <div className="flex items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search meals by name..."
              className="w-64 border rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
            {(search || selectedCats.length > 0) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm rounded-md border hover:bg-gray-50"
              >
                Clear
              </button>
            )}
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

      {/* Grid */}
      <div className="w-full">
        <div className="bg-white rounded-xl p-8 shadow-md min-h-[400px]">
          {isBackendTab && loading ? (
            <div className="text-center text-gray-500">Loading…</div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayMeals.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 text-lg p-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  {activeTab === "my"
                    ? "No saved meals yet"
                    : "No meals match your filters"}
                </div>
              ) : (
                displayMeals.map((meal) => (
                  <MealCard key={meal._id} meal={meal} onClick={() => handleMealClick(meal)} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default ShowMeal;
