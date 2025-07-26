import React, { useState } from 'react';
import './Panel.css';

import MealCreate from './MealCreate';
import MealList from './MealList';
import MealShareRequests from './MealRequest';

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState('');

  const renderSection = () => {
    switch (activeSection) {
      case 'create':
        return <MealCreate />;
      case 'list':
        return <MealList />;
      case 'requests':
        return <MealShareRequests />;
      default:
        return <p className="default-message">Select an admin action from the menu.</p>;
    }
  };

  return (
    <div className="admin-panel-centered">
      <div className="admin-panel">
        <h1 className="panel-title">Admin Panel</h1>

        <div className="admin-menu">
          <button onClick={() => setActiveSection('create')}>Create New Meal</button>
          <button onClick={() => setActiveSection('list')}>View/Edit Meals</button>
          <button onClick={() => setActiveSection('requests')}>Approve Meal Shares</button>
        </div>

        <div className="admin-section-content">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
