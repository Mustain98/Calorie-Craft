import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignUp";
import SigninPage from "./pages/SignIn";
import ProfilePage from "./pages/Profile";
import ChangePasswordPage from "./pages/ChangePassword";
import ShowAllMeal from "./pages/ShowAllMeal";
import NutritionalRequirement from "./pages/NutritionalRequirement";
import MealPlan from "./pages/MealPlan";
import GoalSetting from "./pages/GoalSetting";
import CreateMeal from "./pages/CreateMeal";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
      <ToastContainer position="top-center" autoClose={3000} />
    </Router>
  );
}

export default App;
