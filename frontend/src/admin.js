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

export default function AdminApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLandingPage />} />
        <Route path="/adminpage" element={<AdminProfilePage />} />
        <Route path="/adminshowmeals" element={<AdminShowMeals />} />
        <Route path="/admincreatemeal" element={<AdminCreateMeal />} />
        <Route path="/adminsignin" element={<AdminSigninPage />} />
        {/*<Route path="/changepassword" element={<ChangePasswordPage />} />*/}
        <Route path="/createadmin" element={<CreateAdminPage />} />
        <Route path="/addingredient" element={<AddIngreidentPage />} />

        {/* Add more admin routes here */}
      </Routes>
    </Router>
  );
}
