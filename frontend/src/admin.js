import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminProfilePage from "./pages/AdminProfile";
import AdminShowMeals from "./pages/AdminShowMeals";
import AdminCreateMeal from "./pages/AdminCreateMealPage";
import AdminLandingPage from "./pages/AdminLandingPage";
import AdminSigninPage from "./pages/AdminSignIn";
import ChangePasswordPage from "./pages/ChangePassword";
import CreateAdminPage from "./pages/CreateAdmin";
import AddIngreidentPage from "./pages/AddIngredients";
import ShowIngredients from "./pages/ShowIngredients";
import AdminChangePasswordPage from "./pages/adminChangePassword";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLandingPage />} />
        <Route path="/adminpage" element={<AdminProfilePage />} />
        <Route path="/adminshowmeals" element={<AdminShowMeals />} />
        <Route path="/admincreatemeal" element={<AdminCreateMeal />} />
        <Route path="/adminsignin" element={<AdminSigninPage />} />
        <Route path="/adminChangePass" element={<AdminChangePasswordPage/>}/>
        <Route path="/createadmin" element={<CreateAdminPage />} />
        <Route path="/addingredient" element={<AddIngreidentPage />} />
        <Route path="/showingredients" element={<ShowIngredients/>} />

        {/* Add more admin routes here */}
      </Routes>
      <ToastContainer position="top-center" autoClose={3000} />
    </Router>
  );
}
