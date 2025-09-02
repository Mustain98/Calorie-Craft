import React from "react";
import "./ChangePassword.css";
import LeftSection from "../components/LeftSection";
import UpdatePasswordComponent from "../components/updatePassword";
import { useNavigate } from "react-router-dom";

export default function ChangePasswordPage() {
  const navigate = useNavigate();

  // User Password Regex: 6+ characters, uppercase, lowercase, number
  const userPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  const message = "Password must be at least 6 characters long, with at least one uppercase, one lowercase, and one number.";

  const endpoint = `${process.env.REACT_APP_API_BASE_URL}/api/users/me/password`;

  return (
    <div className="password-page">
      <LeftSection />

      {/* Back button (top-left) */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Go back"
        className="back-btn"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
             viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M14 6L8 12L14 18" stroke="white" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
          <line x1="8" y1="12" x2="20" y2="12" stroke="white" strokeWidth="2"
                strokeLinecap="round" />
        </svg>
      </button>

      <div className="password-right" style={{ position: "relative" }}>
        <div style={{ width: "100%", maxWidth: 420, paddingTop: 48 }}>
          <UpdatePasswordComponent
            endpoint={endpoint}
            tokenKey="token"
            title="Change User Password"
            onSuccess={() => {
              localStorage.removeItem("token");
              navigate("/signin");
            }}
            passwordRegex={userPasswordRegex}
            message={message}
          />
        </div>
      </div>
    </div>
  );
}
