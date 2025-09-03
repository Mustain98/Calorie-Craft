// ProfilePage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import Sidebar from '../components/sideBar';
import axios from 'axios';
import { toast } from "react-toastify";

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
      setEditable({
        email: false,
        gender: false,
        age: false,
        weight: false,
        height: false,
        activityLevel: false,
      });
      toast.success("profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
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

  if (!userData) return <p className="loading-text">Loading profile...</p>;

  return (
    <div className="profile-page">
      <button className="toggle-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
        ⋮
      </button>

      {userData && <Sidebar visible={sidebarVisible} userData={userData} />}

      <main className={`profile-main ${sidebarVisible ? '' : 'sidebar-hidden'}`}>
        <div className="profile-form-container">
          <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-header">
              <div>
                <h2 className="form-title">Your Profile</h2>
                <p className="form-subtitle">Update your personal details</p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUpdateProfile}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating…' : 'Update Profile'}
              </button>
            </div>

            {/* Email */}
            <div className="field">
              <div className="label-row-wrapper">
                <div className="label-container">
                  <label className="label-text" htmlFor="email">Email address</label>
                </div>
              </div>
              <input
                id="email"
                ref={(el) => (inputRefs.current.email = el)}
                className={`input ${!editable.email ? 'is-readonly' : ''}`}
                type="text"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                readOnly={!editable.email}
                aria-readonly={!editable.email}
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
            </div>

            {/* Gender */}
            <div className="field">
              <div className="label-row-wrapper">
                <div className="label-container">
                  <label className="label-text" htmlFor="gender">Gender</label>
                </div>
              </div>

              <select
                id="gender"
                ref={(el) => (inputRefs.current.gender = el)}
                className={`select ${!editable.gender ? 'is-readonly' : ''}`}
                name="gender"
                value={formData.gender || ""}
                onChange={handleChange}
                disabled={!editable.gender}
                required
                aria-disabled={!editable.gender}
              >
                <option value="">Select gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                {/* Add other server-accepted values if needed */}
              </select>

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
            </div>

            {/* Age */}
            <div className="field">
              <div className="label-row-wrapper">
                <div className="label-container">
                  <label className="label-text" htmlFor="age">Age</label>
                </div>
              </div>
              <input
                id="age"
                ref={(el) => (inputRefs.current.age = el)}
                className={`input ${!editable.age ? 'is-readonly' : ''}`}
                type="text"
                name="age"
                value={formData.age || ''}
                onChange={handleChange}
                readOnly={!editable.age}
                aria-readonly={!editable.age}
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
            </div>

            {/* Weight */}
            <div className="field">
              <div className="label-row-wrapper">
                <div className="label-container">
                  <label className="label-text" htmlFor="weight">Weight (kg)</label>
                </div>
              </div>
              <input
                id="weight"
                ref={(el) => (inputRefs.current.weight = el)}
                className={`input ${!editable.weight ? 'is-readonly' : ''}`}
                type="text"
                name="weight"
                value={formData.weight || ''}
                onChange={handleChange}
                readOnly={!editable.weight}
                aria-readonly={!editable.weight}
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
            </div>

            {/* Height */}
            <div className="field">
              <div className="label-row-wrapper">
                <div className="label-container">
                  <label className="label-text" htmlFor="height">Height (cm)</label>
                </div>
              </div>
              <input
                id="height"
                ref={(el) => (inputRefs.current.height = el)}
                className={`input ${!editable.height ? 'is-readonly' : ''}`}
                type="text"
                name="height"
                value={formData.height || ''}
                onChange={handleChange}
                readOnly={!editable.height}
                aria-readonly={!editable.height}
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
            </div>

            {/* Activity Level */}
            <div className="field">
              <div className="label-row-wrapper">
                <div className="label-container">
                  <label className="label-text" htmlFor="activityLevel">Activity Level</label>
                </div>
              </div>
              <select
                id="activityLevel"
                ref={(el) => (inputRefs.current.activityLevel = el)}
                className={`select ${!editable.activityLevel ? 'is-readonly' : ''}`}
                name="activityLevel"
                value={formData.activityLevel || ''}
                onChange={handleChange}
                disabled={!editable.activityLevel}
                required
                aria-disabled={!editable.activityLevel}
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
            </div>

            <div className="actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleChangePassword}
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
