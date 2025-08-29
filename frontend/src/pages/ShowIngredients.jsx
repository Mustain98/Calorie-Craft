import axios from "axios";
import React, { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function ShowIngredients() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [fooditems, setfooditems] = useState([]);
  const [adminData, setAdminData] = useState();
  const [deletingId, setDeletingId] = useState(null); // which item is being deleted
  const [selectedCategory, setSelectedCategory] = useState("all"); // category filter
  const navigate = useNavigate();

  const categories = [
    "all",
    "protein",
    "carb",
    "fat",
    "vegetable",
    "fruit",
    "nut",
    "dairy",
    "other",
  ];

  // fetch admin data on mount
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
  }, [navigate]);

  // fetch food items when component mounts or selectedCategory changes
  useEffect(() => {
    const fetchItems = async () => {
      try {
        let url = `${process.env.REACT_APP_API_ADMIN_URL}/api/fooditem/`;
        if (selectedCategory !== "all") {
          url = `${process.env.REACT_APP_API_ADMIN_URL}/api/fooditem/by_category/${selectedCategory}`;
        }

        const res = await axios.get(url);
        setfooditems(res.data || []);
      } catch (err) {
        console.error("Failed to fetch food items:", err);
        toast.error("Failed to fetch food items");
        setfooditems([]);
      }
    };

    fetchItems();
  }, [selectedCategory]);

  const toggleSidebar = () => setSidebarVisible((v) => !v);

  // handle delete
  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this ingredient?");
    if (!ok) return;

    setDeletingId(id);

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${process.env.REACT_APP_API_ADMIN_URL}/api/fooditem/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setfooditems((prev) => prev.filter((f) => f._id !== id));
      toast.success("Ingredient deleted successfully!");
    } catch (err) {
      console.error("Failed to delete item:", err);
      toast.error("Failed to delete ingredient. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-row w-full h-screen">
      <button className="toggle-btn" onClick={toggleSidebar}>
        &#8942;
      </button>
      {sidebarVisible && <AdminSidebar visible={sidebarVisible} AdminData={adminData} />}

      <div className={`transition-all duration-300 flex-1 p-6 ${sidebarVisible ? "ml-[250px]" : ""}`}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Ingredients List</h2>

            <div className="flex items-center space-x-2">
              <label htmlFor="category" className="text-sm">Category:</label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <table className="w-full border border-gray-300 table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-400 px-4 py-2 text-center">Calories</th>
                <th className="border border-gray-400 px-4 py-2 text-center">Carbs (g)</th>
                <th className="border border-gray-400 px-4 py-2 text-center">Protein (g)</th>
                <th className="border border-gray-400 px-4 py-2 text-center">Fat (g)</th>
                <th className="border border-gray-400 px-4 py-2 text-center">Category</th>
                <th className="border border-gray-400 px-4 py-2 text-center">Total Unit Weight</th>
                <th className="border border-gray-400 px-4 py-2 text-center">Measuring Unit</th>
                <th className="border border-gray-400 px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fooditems.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center p-4">No ingredients found.</td>
                </tr>
              ) : (
                fooditems.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{item.calories}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{item.carbs}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{item.protein}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{item.fat}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{item.category}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{item.totalunitweight}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{item.measuringUnit}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <button
                        onClick={() => handleDelete(item._id)}
                        disabled={deletingId === item._id}
                        title="Delete"
                        aria-label={`Delete ${item.name}`}
                        className={`inline-flex items-center justify-center p-2 rounded ${
                          deletingId === item._id ? "opacity-50 cursor-not-allowed" : "hover:bg-red-50"
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-red-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

