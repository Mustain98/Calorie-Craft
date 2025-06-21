import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignUp';
import SigninPage from './pages/SignIn';




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
       <Route path="/signup" element={<SignupPage />} />
      
<Route path="/login" element={<SigninPage />} />
       
      </Routes>
    </Router>
  );
}

export default App;
