import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from "../components/AdminSidebar";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function AddIngreidentPage() {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [adminData, setAdminData] = useState({});

  useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/adminsignin');

      axios.get(`${process.env.REACT_APP_API_ADMIN_URL}/api/admin/me`, {
      headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setAdminData(res.data))
      .catch(() => {
      localStorage.removeItem('token');
      navigate('/adminsignin');
      });
  }, [navigate]);


  
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    calories: '', 
    protein: '', 
    carbs: '', 
    fat: '' ,
    measuringUnit:'',
    totalunitweight:'',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // const token = localStorage.getItem('token');

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
  const handleLogout = () => { localStorage.clear(); navigate('/login'); };


  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
     try {
       const res = await axios.post(
       `${process.env.REACT_APP_API_ADMIN_URL}/api/admin/foodItem`,
       formData,
       { headers: { Authorization: `Bearer ${token}` } }
     );
     
       setSuccess(`"${res.data.name}" created successfully!`);
       toast.success(`"${res.data.name}" created successfully!`);
       // reset form
       setFormData({ name:'', category:'', calories:'', protein:'', carbs:'', fat:'',measuringUnit:'',totalunitweight:'' });
     } catch (err) {
       console.error('createFoodItem error:', err.response?.status, err.response?.data);
       setError(err.response?.data?.error || 'Failed to create food item');
       toast.error(err.response?.data?.error || 'Failed to create food item');
     }
  };
  const handleChange = e => {
  const { name, value } = e.target;
  setFormData(f => ({ ...f, [name]: value }));
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarVisible ? "block" : "hidden"} md:block`}>
        <button className="toggle-btn" onClick={toggleSidebar}>&#8942;</button>
        <AdminSidebar 
          visible={sidebarVisible} 
          onLogout={handleLogout} 
          AdminData={adminData} 
        />
      </div>

      {/* Main Content */}
      <main className={`flex-grow p-6 transition-all duration-300 ${sidebarVisible ? 'ml-64' : 'ml-0'}`}>
        <button
          className="md:hidden mb-4 text-3xl font-bold focus:outline-none"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          ☰
        </button>

        <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Add New Ingredient</h2>

          {error && <div className="mb-4 text-red-600">{error}</div>}
          {success && <div className="mb-4 text-green-600">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ingredient Name */}
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Ingredient Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Category</option>
                {['protein','carb','fat','vegetable','fruit','nut','dairy','other'].map(c => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Nutrition Inputs */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Nutrition Facts</h3>
              <div className="grid grid-cols-2 gap-4">
                {['calories','protein','carbs','fat'].map(key => (
                  <div key={key}>
                    <label className="block mb-1 font-medium text-gray-700">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                    <input
                      type="number"
                      name={key}
                      value={formData[key]}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* Measuring Unit */}
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Measuring Unit
              </label>
              <select
                name="measuringUnit"
                value={formData.measuringUnit}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Unit</option>
                {['ml','gm','pcs','tbsp'].map(unit => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
              {/* Unit Weight (grams per piece or ml) */}
            <div>
                  <label className="block mb-1 font-medium text-gray-700">
                    Unit Weight (in grams)
                  </label>
                  <input
                    type="number"
                    name="totalunitweight"
                    value={formData.totalunitweight || ''}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded transition"
            >
              Save to System Collection
            </button>
          </form>
        </div>

        <ToastContainer position="top-center" autoClose={3000} />
      </main>
    </div>
  );
}