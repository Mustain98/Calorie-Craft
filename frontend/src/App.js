import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignUp';
import SigninPage from './pages/SignIn';
import ProfilePage from './pages/Profile';
import ChangePasswordPage from './pages/ChangePassword';






function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
       <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<SigninPage />} />
      <Route path="/profile" element={<ProfilePage />} /> 
        <Route path="/changepassword" element={<ChangePasswordPage />} />
      </Routes>
    </Router>
  );
}

export default App;
