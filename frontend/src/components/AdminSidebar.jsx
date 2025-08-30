import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiUser,
  FiPlusCircle,
  FiDatabase,
  FiList,
  FiLogOut,
} from "react-icons/fi";
import logo from "../logo2.jpg";

export default function AdminSidebar({ visible, AdminData = {} }) {
  const navigate = useNavigate();
  const location = useLocation(); // to determine active button
  if (!visible) return null;

  const handleLogout = () => {
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("admin");
      navigate("/");
    }, 500);
  };

  const { name = "Admin", email = "", accessLevel = "", avatar } = AdminData;

  const menuItems = [
    {
      label: "Profile",
      path: "/adminpage",
      icon: <FiUser className="mr-3 text-lg" />,
    },
    {
      label: "Create Meal",
      path: "/admincreatemeal",
      icon: <FiPlusCircle className="mr-3 text-lg" />,
    },
    {
      label: "Create Ingredients",
      path: "/addingredient",
      icon: <FiDatabase className="mr-3 text-lg" />,
    },
    {
      label: "Show Meals",
      path: "/adminshowmeals",
      icon: <FiList className="mr-3 text-lg" />,
    },
    {
      label: "Show Ingredients",
      path: "/showingredients",
      icon: <FiList className="mr-3 text-lg" />,
    },
  ];

  if (Number(accessLevel) === 2) {
    menuItems.push({
      label: "Create Admin",
      path: "/createadmin",
      icon: <FiUser className="mr-3 text-lg" />,
    });
  }

  // Always add Logout at the end
  menuItems.push({
    label: "Log out",
    action: handleLogout,
    icon: <FiLogOut className="mr-3 text-lg" />,
  });

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white shadow-2xl flex flex-col items-center p-4 z-50">
      {/* Logo */}
      <div className="flex flex-col items-center mb-4">
        <img src={logo} alt="Calorie Craft" className="w-12 h-12 mb-1" />
        <h1 className="text-xl font-bold text-gray-800">Calorie Craft</h1>
      </div>

      {/* Admin Info */}
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
