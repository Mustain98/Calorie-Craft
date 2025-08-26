import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

export default function MealForm({
  apiBaseUrl,
  userEndpoint,
  submitEndpoint,
  SidebarComponent,
  loginRedirectPath,
  successMessages,
  buttonLabels,
}) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [userData, setUserData] = useState();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ingredients: [],
    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    imageFile: null,
    category:[]
  });

  const [share, setShare] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const toggleSidebar = () => setSidebarVisible((v) => !v);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleFileChange = (e) => {
    setFormData((f) => ({ ...f, imageFile: e.target.files[0] || null }));
  };

  const handleRemoveIngredient = (i) => {
    setFormData((f) => ({
      ...f,
      ingredients: f.ingredients.filter((_, idx) => idx !== i),
    }));
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query) return setSuggestions([]);

    try {
      const res = await axios.get(
        `${apiBaseUrl}/api/foodItem/search?q=${query}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuggestions(res.data);
    } catch {
      setSuggestions([]);
    }
  };

  const handleAddIngredient = (item) => {
    setFormData((f) => {
      if (f.ingredients.find((i) => i._id === item._id)) return f;
      return {
        ...f,
        ingredients: [...f.ingredients, { ...item, quantity: 1 }],
      };
    });
    setSearchQuery("");
    setSuggestions([]);
  };

  useEffect(() => {
    const calculateNutrition = () => {
      const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      for (const item of formData.ingredients) {
        const qty = parseFloat(item.quantity) || 1;
        totals.calories += item.calories * qty;
        totals.protein += item.protein * qty;
        totals.carbs += item.carbs * qty;
        totals.fat += item.fat * qty;
      }
      const rounded = {
        calories: +totals.calories.toFixed(3),
        protein: +totals.protein.toFixed(3),
        carbs: +totals.carbs.toFixed(3),
        fat: +totals.fat.toFixed(3),
      };
      setFormData((f) => ({ ...f, nutrition: rounded }));
    };
    calculateNutrition();
  }, [formData.ingredients]);

  useEffect(() => {
    if (!token) return navigate(loginRedirectPath);

    const fetchUser = async () => {
      try {
        const res = await axios.get(`${apiBaseUrl}${userEndpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        localStorage.removeItem("token");
        navigate(loginRedirectPath);
      }
    };

    fetchUser();
  }, [navigate, token, apiBaseUrl, userEndpoint, loginRedirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("description", formData.description);
      fd.append("calories", formData.nutrition.calories);
      fd.append("protein", formData.nutrition.protein);
      fd.append("carbs", formData.nutrition.carbs);
      fd.append("fat", formData.nutrition.fat);
      fd.append("category", JSON.stringify(formData.category));
      fd.append("share", share);
      fd.append(
        "foodItems",
        JSON.stringify(
          formData.ingredients.map((i) => ({
            food: i._id,
            quantity: i.quantity || 1,
          }))
        )
      );
      if (formData.imageFile) fd.append("image", formData.imageFile);

      await axios.post(`${apiBaseUrl}${submitEndpoint}`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(share ? successMessages.shared : successMessages.saved);
      toast.success(share ? successMessages.shared : successMessages.saved);

      setFormData({
        name: "",
        description: "",
        ingredients: [],
        nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        imageFile: null,
        category:[]
      });
      setSearchQuery("");
      setSuggestions([]);

      if (fileInputRef.current) fileInputRef.current.value = null;
    } catch (err) {
      setError(err.response?.data?.error || "Submission failed");
      toast.error("Submission failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarVisible ? "block" : "hidden"} md:block`}>
        <button className="toggle-btn" onClick={toggleSidebar}>&#8942;</button>
        <SidebarComponent visible={sidebarVisible} onLogout={handleLogout} userData={userData} />
      </div>

      {/* Main content */}
      <main className={`flex-grow p-6 transition-all duration-300 ${!sidebarVisible ? "ml-0" : "ml-64"}`}>
        <button
          className="md:hidden mb-4 text-3xl font-bold focus:outline-none"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          ☰
        </button>

        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Create New Meal</h2>

          {error && <p className="mb-4 text-red-600 font-semibold">{error}</p>}
          {success && <p className="mb-4 text-green-600 font-semibold">{success}</p>}

          <form onSubmit={handleSubmit}>

            {/* Meal Name */}
            <div className="mb-4">
              <label htmlFor="name" className="block mb-1 font-medium text-gray-700">Meal Name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label htmlFor="description" className="block mb-1 font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>

            {/* Image */}
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">Meal Image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-gray-700"
              />
            </div>

            {/* Search Ingredient */}
            <div className="mb-6 relative">
              <label className="block mb-1 font-medium text-gray-700">Search Ingredient</label>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Type to search..."
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {suggestions.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-300 rounded mt-1 w-full max-h-48 overflow-auto shadow-lg">
                  {suggestions.map((item) => (
                    <li
                      key={item._id}
                      onClick={() => handleAddIngredient(item)}
                      className="px-3 py-2 cursor-pointer hover:bg-indigo-100"
                    >
                      {item.name} ({item.measuringUnit.toUpperCase()}) – {item.calories} kcal
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Added Ingredients */}
            <div className="mb-6">
              <label className="block mb-1 font-medium text-gray-700">Added Ingredients</label>
              {formData.ingredients.length === 0 && (
                <p className="text-gray-500">No ingredients added yet.</p>
              )}
              {formData.ingredients.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-2 mb-2 border rounded px-3 py-2"
                >
                  <input
                    type="text"
                    value={item.name}
                    readOnly
                    className="flex-grow border border-gray-300 rounded px-2 py-1 bg-gray-100"
                  />
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={item.quantity === "" ? "" : item.quantity}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val === "") {
                        setFormData((f) => {
                          const updated = [...f.ingredients];
                          updated[i] = { ...updated[i], quantity: val };
                          return { ...f, ingredients: updated };
                        });
                        return;
                      }
                      val = parseFloat(val);
                      if (isNaN(val) || val < 0.1) val = 0.1;
                      setFormData((f) => {
                        const updated = [...f.ingredients];
                        updated[i] = { ...updated[i], quantity: val };
                        return { ...f, ingredients: updated };
                      });
                    }}
                    className="w-20 border border-gray-300 rounded px-2 py-1"
                  />
                  <span className="text-gray-600 select-none">
                    {item.measuringUnit.toLowerCase() === "pcs"
                      ? `x ${item.totalunitweight} gm per ${item.measuringUnit}`
                      : `x ${item.totalunitweight} ${item.measuringUnit}`}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(i)}
                    className="text-red-600 hover:text-red-800 font-bold text-xl"
                    aria-label="Remove ingredient"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
              {/* Category */}
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">
                Categories
              </label>
              <div className="flex flex-wrap gap-3">
                {["breakfast", "lunch", "dinner", "snack", "main dish", "side dish","dessert","drink"].map((cat) => (
                  <label key={cat} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={cat}
                      checked={formData.category.includes(cat)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData((f) => ({
                            ...f,
                            category: [...f.category, cat],
                          }));
                        } else {
                          setFormData((f) => ({
                            ...f,
                            category: f.category.filter((c) => c !== cat),
                          }));
                        }
                      }}
                      className="form-checkbox h-4 w-4 text-indigo-600"
                    />
                    <span className="capitalize">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Nutrition Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Total Nutrition</h3>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                {["calories", "protein", "carbs", "fat"].map((key) => (
                  <div key={key}>
                    <label className="block mb-1 font-medium text-gray-700">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                    <input
                      type="number"
                      value={formData.nutrition[key]}
                      readOnly
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4">
              {buttonLabels.map(({ text, onClick }, idx) => (
                <button
                  key={idx}
                  type="submit"
                  className={`flex-grow py-2 rounded font-semibold text-white ${
                    onClick ? "bg-indigo-600 hover:bg-indigo-700" : "bg-green-500 hover:bg-green-700"
                  } transition-colors duration-200`}
                  onClick={() => {
                    if (onClick) onClick();
                    else setShare(false);
                  }}
                >
                  {text}
                </button>
              ))}
            </div>
          </form>
        </div>

        <ToastContainer />
      </main>
    </div>
  );
}
