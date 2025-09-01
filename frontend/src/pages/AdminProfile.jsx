import axios from "axios";
import logo from "../logo.png";
import "./Profile.css";
import AdminSidebar from "../components/AdminSidebar";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

export default function AdminProfilePage() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/adminsignin");

    const fetchAdmin = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_ADMIN_URL}/api/admin/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAdminData(res.data);
        setFormData(res.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        localStorage.removeItem("token");
        navigate("/adminsignin");
      }
    };

    fetchAdmin();
  }, [navigate]);

  if (!adminData) return <p>Loading profile...</p>;
  return (
    <div className="profile-page">
      <button className="toggle-btn" onClick={toggleSidebar}>
        &#8942;
      </button>
      {sidebarVisible && (
        <AdminSidebar visible={sidebarVisible} AdminData={adminData} />
      )}
      <main
        className={`profile-main ${sidebarVisible ? "" : "sidebar-hidden"}`}
      >
        <div className="profile-form-container">
          <form className="profile-form">
            <div className="form-header">
              <h2>Admin Profile</h2>
            </div>

            <label>User</label>
            <input type="text" name="name" value={formData.name} readOnly />

            <label>Email Address</label>
            <input type="text" name="email" value={formData.email} readOnly />

            <label>Access Level</label>
            <input
              type="text"
              name="accessLevel"
              value={
                formData.accessLevel === 1
                  ? "Moderator"
                  : formData.accessLevel === 2
                  ? "Admin"
                  : "Unknown"
              }
              readOnly
            />

            <button
              type="button"
              className="change-password-btn"
              onClick={() => navigate("/changepassword")}
            >
              Change Password
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
