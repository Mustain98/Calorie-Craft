import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import SignIn from './pages/SignIn';
import ProfilePage from './pages/Profile'; // dummy user dashboard
import AdminPanel from './AdminPanel/Panel'; // admin panel component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
