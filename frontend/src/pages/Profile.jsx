import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import Sidebar from '../components/sideBar';
import axios from 'axios';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editable, setEditable] = useState({
    email: false,
    gender: false,
    age: false,
    weight: false,
    height: false,
    activityLevel: false,
  });

  const inputRefs = useRef({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/signin');

    const fetchUser = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data);
        setFormData(res.data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        localStorage.removeItem('token');
        navigate('/signin');
      }
    };

    fetchUser();
  }, [navigate]);

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
  const handleChangePassword = () => navigate('/changepassword');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/users/me`, {
        email: formData.email,
        age: formData.age,
        gender: formData.gender,
        weight: formData.weight,
        height: formData.height,
        activityLevel: formData.activityLevel
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Profile updated successfully');
      setEditable({
        email: false,
        gender: false,
        age: false,
        weight: false,
        height: false,
        activityLevel: false,
      });
    } catch (err) {
      alert('Failed to update profile');
    }
    setIsSubmitting(false);
  };

  const handleToggleEdit = (field) => {
    setEditable(prev => {
      const newState = { ...prev, [field]: !prev[field] };
      if (!prev[field]) {
        setTimeout(() => {
          inputRefs.current[field]?.focus?.();
          if (inputRefs.current[field] && inputRefs.current[field].select) {
            inputRefs.current[field].select();
          }
        }, 0);
      } else {
        setTimeout(() => {
          inputRefs.current[field]?.blur?.();
        }, 0);
      }
      return newState;
    });
  };

  if (!userData) return <p>Loading profile...</p>;

  return (
    <div className="profile-page">
      <button className="toggle-btn" onClick={toggleSidebar}>&#8942;</button>

      {userData && <Sidebar visible={sidebarVisible} userData={userData} />}

      <main className={`profile-main ${sidebarVisible ? '' : 'sidebar-hidden'}`}>
        <div className="profile-form-container">
          <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
  <div className="form-header">
    <h2>Your Profile</h2>
    <button
      type="button"
      className="update-btn"
      onClick={handleUpdateProfile}
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Updating...' : 'Update Profile'}
    </button>
  </div>

  {/* Email */}
  <div className="label-row-wrapper">
    <div className="label-container">
      <label className="label-text">Email address</label>
      {/* removed the old Edit button from here */}
    </div>
  </div>
  <input
    ref={(el) => (inputRefs.current.email = el)}
    type="text"
    name="email"
    value={formData.email || ''}
    onChange={handleChange}
    readOnly={!editable.email}
  />
  <div className="edit-row">
    <button
      type="button"
      className="edit-below-btn"
      onClick={() => handleToggleEdit('email')}
      aria-pressed={editable.email}
    >
      {editable.email ? 'Done' : 'Edit'}
    </button>
  </div>

  {/* Sex */}
  <div className="label-row-wrapper">
    <div className="label-container">
      <label className="label-text">Sex</label>
    </div>
  </div>
  <input
    ref={(el) => (inputRefs.current.gender = el)}
    type="text"
    name="gender"
    value={formData.gender || ''}
    onChange={handleChange}
    readOnly={!editable.gender}
  />
  <div className="edit-row">
    <button
      type="button"
      className="edit-below-btn"
      onClick={() => handleToggleEdit('gender')}
      aria-pressed={editable.gender}
    >
      {editable.gender ? 'Done' : 'Edit'}
    </button>
  </div>

  {/* Age */}
  <div className="label-row-wrapper">
    <div className="label-container">
      <label className="label-text">Age</label>
    </div>
  </div>
  <input
    ref={(el) => (inputRefs.current.age = el)}
    type="text"
    name="age"
    value={formData.age || ''}
    onChange={handleChange}
    readOnly={!editable.age}
  />
  <div className="edit-row">
    <button
      type="button"
      className="edit-below-btn"
      onClick={() => handleToggleEdit('age')}
      aria-pressed={editable.age}
    >
      {editable.age ? 'Done' : 'Edit'}
    </button>
  </div>

  {/* Weight */}
  <div className="label-row-wrapper">
    <div className="label-container">
      <label className="label-text">Weight (kg)</label>
    </div>
  </div>
  <input
    ref={(el) => (inputRefs.current.weight = el)}
    type="text"
    name="weight"
    value={formData.weight || ''}
    onChange={handleChange}
    readOnly={!editable.weight}
  />
  <div className="edit-row">
    <button
      type="button"
      className="edit-below-btn"
      onClick={() => handleToggleEdit('weight')}
      aria-pressed={editable.weight}
    >
      {editable.weight ? 'Done' : 'Edit'}
    </button>
  </div>

  {/* Height */}
  <div className="label-row-wrapper">
    <div className="label-container">
      <label className="label-text">Height (cm)</label>
    </div>
  </div>
  <input
    ref={(el) => (inputRefs.current.height = el)}
    type="text"
    name="height"
    value={formData.height || ''}
    onChange={handleChange}
    readOnly={!editable.height}
  />
  <div className="edit-row">
    <button
      type="button"
      className="edit-below-btn"
      onClick={() => handleToggleEdit('height')}
      aria-pressed={editable.height}
    >
      {editable.height ? 'Done' : 'Edit'}
    </button>
  </div>

  {/* Activity Level */}
  <div className="label-row-wrapper">
    <div className="label-container">
      <label className="label-text">Activity Level</label>
    </div>
  </div>
  <select
    ref={(el) => (inputRefs.current.activityLevel = el)}
    name="activityLevel"
    value={formData.activityLevel || ''}
    onChange={handleChange}
    disabled={!editable.activityLevel}
    required
  >
    <option value="">Select activity level</option>
    <option value="sedentary">Sedentary</option>
    <option value="light">Lightly active</option>
    <option value="moderate">Moderately active</option>
    <option value="active">Active</option>
    <option value="very active">Very active</option>
  </select>
  <div className="edit-row">
    <button
      type="button"
      className="edit-below-btn"
      onClick={() => handleToggleEdit('activityLevel')}
      aria-pressed={editable.activityLevel}
    >
      {editable.activityLevel ? 'Done' : 'Edit'}
    </button>
  </div>

  <button
    type="button"
    className="change-password-btn"
    onClick={handleChangePassword}
  >
    Change Password
  </button>
</form>

        </div>
      </main>
    </div>
  );
}

