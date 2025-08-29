import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiUser,
  FiActivity,
  FiList,
  FiPlusCircle,
  FiClipboard,
  FiLogOut,
  FiSettings,
} from "react-icons/fi";
import logo from "../logo2.jpg";
import { toast } from "react-toastify";

export default function Sidebar({ visible, userData = {} }) {
  const navigate = useNavigate();
  const location = useLocation(); // current path
  if (!visible) return null;

  const handleLogout = () => {
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.success("Logout Successfully");
      navigate("/signin");
    }, 500);
  };

  const { name = "Guest", email = "", avatar } = userData;

  const menuItems = [
    {
      label: "Profile",
      path: "/profile",
      icon: <FiUser className="mr-3 text-lg" />,
    },
    {
      label: "Nutritional Requirement",
      path: "/nutrition",
      icon: <FiActivity className="mr-3 text-lg" />,
    },
    {
      label: "Show All Meal",
      path: "/showmeal",
      icon: <FiList className="mr-3 text-lg" />,
    },
    {
      label: "Create Meal",
      path: "/createmeal",
      icon: <FiPlusCircle className="mr-3 text-lg" />,
    },
    {
      label: "Meal Plan Settings",
      path: "/mealsetting",
      icon: <FiSettings className="mr-3 text-lg" />,
    },
    {
      label: "Meal Plan",
      path: "/mealplan",
      icon: <FiClipboard className="mr-3 text-lg" />,
    },
    {
      label: "Log out",
      action: handleLogout,
      icon: <FiLogOut className="mr-3 text-lg" />,
    },
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white shadow-2xl flex flex-col items-center p-4 z-50">
      {/* Logo */}
      <div className="flex flex-col items-center mb-4">
        <img
          src={logo}
          alt="Calorie Craft"
          className="w-12 h-12 mb-1"
        />
        <h1 className="text-xl font-bold text-gray-800">Calorie Craft</h1>
      </div>

      {/* User Info */}
      <div className="w-full flex flex-col items-center mb-4 bg-green-50 rounded-xl p-2 shadow-inner">
        <img
          src={avatar || "https://randomuser.me/api/portraits/lego/1.jpg"}
          alt={name}
          className="w-14 h-14 rounded-full mb-1 border-2 border-green-200"
        />
        <h4 className="text-gray-800 font-semibold text-sm">{name}</h4>
        <p className="text-gray-700 font-semibold text-sm truncate">{email}</p>
      </div>

      {/* Menu */}
      <nav className="flex flex-col flex-grow w-full justify-between mt-2">
        {menuItems.map((item, idx) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={idx}
              onClick={() => (item.path ? navigate(item.path) : item.action())}
              className={`flex items-center w-full px-3 py-3 text-left text-gray-700 rounded-lg font-medium transition-colors shadow-sm border-l-4 border-transparent text-sm flex-1
                ${
                  isActive
                    ? "bg-green-100 text-green-800 border-green-500"
                    : "hover:bg-green-100 hover:text-green-800 hover:border-green-500"
                }
              `}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
        <div className="h-2"></div>
      </nav>
    </aside>
  );
}
