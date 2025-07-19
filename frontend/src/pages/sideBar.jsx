import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../logo.png';
import './sideBar.css';

export default function Sidebar({
  visible,
  userData = {},
}) {
  const navigate = useNavigate();
  if (!visible) return null;

  const handleLogout = () => {
    setTimeout(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }, 1000);
  };

  const { name = 'Guest', email = '', avatar } = userData;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="Calorie Craft" className="sidebar-logo" />
        <h2>Calorie Craft</h2>
      </div>

      <img
          src={avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}
          alt={name}
          className="user-avatar"/>
      <h4>Hello, {name}</h4>
      <p>{email}</p>
      
      <nav className="sidebar-menu">
        <button onClick={() => navigate('/profile')}>Profile</button>
        <button onClick={() => navigate('/showmeal')}>Show All Meal</button>
        <button onClick={() => navigate('/createmeal')}>Create Meal</button>
        <button onClick={() => navigate('/mealplan')}>Meal Plan</button>
        <button onClick={() => navigate('/nutrition')}>Nutritional Requirement</button>
        <button onClick={() => navigate('/goal')}>Goal Setting</button>
        <button onClick={handleLogout}>Log out</button>
      </nav>

    </aside>
  );
}