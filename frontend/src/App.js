import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignUp';
import SigninPage from './pages/SignIn';
import ProfilePage from './pages/Profile';
import ChangePasswordPage from './pages/ChangePassword';
import ShowAllMeal from './pages/ShowAllMeal'; // Import the new component

// Temporary placeholder components
const MealPlan = () => <h2 style={{ padding: '2rem' }}>Meal Plan - Feature under development</h2>;
const CustomizePlan = () => <h2 style={{ padding: '2rem' }}>Customize Plan - Feature under development</h2>;
const Nutrition = () => <h2 style={{ padding: '2rem' }}>Nutritional Requirement - Feature under development</h2>;
const GoalSetting = () => <h2 style={{ padding: '2rem' }}>Goal Setting - Feature under development</h2>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<SigninPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/changepassword" element={<ChangePasswordPage />} />
        
        {/* Updated route for ShowAllMeal */}
        <Route path="/showmeal" element={<ShowAllMeal />} />
        <Route path="/mealplan" element={<MealPlan />} />
        <Route path="/customizeplan" element={<CustomizePlan />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/goal" element={<GoalSetting />} />
      </Routes>
    </Router>
  );
}

export default App;