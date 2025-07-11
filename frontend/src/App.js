import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignUp';
import SigninPage from './pages/SignIn';
import ProfilePage from './pages/Profile';
import ChangePasswordPage from './pages/ChangePassword';
import ShowAllMeal from './pages/ShowAllMeal';
import NutritionalRequirement from './pages/NutritionalRequirement';
import MealPlan from './pages/MealPlan'; // ✅ Import the real MealPlan component
import GoalSetting from './pages/GoalSetting'; // Optional: replace if you later create this

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<SigninPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/changepassword" element={<ChangePasswordPage />} />
        <Route path="/showmeal" element={<ShowAllMeal />} />
        <Route path="/mealplan" element={<MealPlan />} />
        <Route path="/nutrition" element={<NutritionalRequirement />} />
        <Route path="/goal" element={<GoalSetting />} /> {/* You can keep this or replace later */}
      </Routes>
    </Router>
  );
}

export default App;