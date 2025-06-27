import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../logo.png';

const Navbar = ({ 
  sidebarVisible, 
  setSidebarVisible, 
  userData, 
  activePage 
}) => {
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  const menuItems = [
    { key: 'profile', label: 'Profile', path: '/profile' },
    { key: 'showmeal', label: 'Show All Meal', path: '/showmeal' },
    { key: 'mealplan', label: 'Meal Plan', path: '/mealplan' },
    { key: 'nutrition', label: 'Nutritional Requirement', path: '/nutrition' },
    { key: 'goal', label: 'Goal Setting', path: '/goal' }
  ];

  return (
    <>
      {/* Toggle Button */}
      <button className="toggle-btn" onClick={toggleSidebar}>
        &#8942;
      </button>

      {/* Sidebar */}
      {sidebarVisible && (
        <aside className="sidebar">
          <div className="sidebar-header">
            <img src={logo} alt="Calorie Craft" className="sidebar-logo" />
            <h2>Calorie Craft</h2>
          </div>

          <div className="sidebar-user">
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="User"
              className="user-avatar"
            />
            <h4>Hello! {userData?.name || 'User'}</h4>
            <p>{userData?.email || 'user@example.com'}</p>
          </div>

          <div className="sidebar-content">
            <nav className="sidebar-menu">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  className={activePage === item.key ? 'active' : ''}
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="logout-container">
              <button className="logout-btn" onClick={handleLogout}>
                Log out
              </button>
            </div>
          </div>
        </aside>
      )}
    </>
  );
};

export default Navbar;