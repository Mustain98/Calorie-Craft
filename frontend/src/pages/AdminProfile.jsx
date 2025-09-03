import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminProfilePage() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/adminsignin");

    const fetchAdmin = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_ADMIN_URL}/api/admin/me`,
          { headers: { Authorization: `Bearer ${token}` } }
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

  if (!adminData) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <p className="text-slate-600 text-sm">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex bg-slate-50 text-slate-900">
      {/* Sidebar toggle */}
      <button
        onClick={() => setSidebarVisible((v) => !v)}
        className="fixed top-4 left-4 z-50 grid h-10 w-10 place-items-center rounded-full bg-lime-500 text-white shadow-lg transition hover:bg-lime-600 active:scale-95"
        aria-label="Toggle sidebar"
      >
        {/* three dots */}
        <span className="text-xl leading-none">⋮</span>
      </button>

      {/* Sidebar */}
      {sidebarVisible && (
        <div className="w-[250px] shrink-0">
          <AdminSidebar visible={sidebarVisible} AdminData={adminData} />
        </div>
      )}

      {/* Main */}
      <main
        className={`flex-1 transition-[margin] duration-300 ${
          sidebarVisible ? "ml-0 md:ml-0" : ""
        } w-full`}
      >
        <div className="mx-auto w-full max-w-3xl p-6 md:p-10">
          {/* Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_rgba(16,24,40,0.08)]">
            {/* Header */}
            <div className="mb-6 border-b border-slate-200 pb-4">
              <h2 className="text-xl font-semibold tracking-tight">Admin Profile</h2>
              <p className="mt-1 text-xs text-slate-500">
                View your account and access level.
              </p>
            </div>

            <form
              className="grid gap-5"
              onSubmit={(e) => e.preventDefault()}
            >
              {/* User */}
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium text-slate-700">
                  User
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  readOnly
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none ring-lime-500/20 focus:ring-4"
                />
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="text"
                  name="email"
                  value={formData.email || ""}
                  readOnly
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none ring-lime-500/20 focus:ring-4"
                />
              </div>

              {/* Access Level */}
              <div className="grid gap-2">
                <label htmlFor="accessLevel" className="text-sm font-medium text-slate-700">
                  Access Level
                </label>
                <input
                  id="accessLevel"
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none ring-lime-500/20 focus:ring-4"
                />
              </div>

              {/* Actions */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/adminChangePass")}
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/25 active:translate-y-[1px]"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>

          {/* Footer / meta (optional) */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Logged in as <span className="font-medium">{formData.email}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
