import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignUp';
import SigninPage from './pages/SignIn';
import Profile from './pages/Profile';
import ChangePasswordPage from './pages/ChangePassword';
import ShowAllMeal from './pages/ShowAllMeal';
import NutritionalRequirement from './pages/NutritionalRequirement';
import MealPlan from './pages/MealPlan';
import GoalSetting from './pages/GoalSetting';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<SigninPage />} />
        <Route path="/signin" element={<SigninPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/changepassword" element={<ChangePasswordPage />} />
        <Route path="/showmeal" element={<ShowAllMeal />} />
        <Route path="/mealplan" element={<MealPlan />} />
        <Route path="/nutrition" element={<NutritionalRequirement />} />
        <Route path="/goal" element={<GoalSetting />} />
      </Routes>
    </Router>
  );
}

export default App;