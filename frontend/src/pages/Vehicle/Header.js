// frontend/src/pages/Vehicle/Header.js
import React from "react";
import { useNavigate } from "react-router-dom";

const Header = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/LoginForm");
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold">SafariGo</div>
        <div className="relative group">
          <div className="flex items-center cursor-pointer">
            {user && user.profilePicture ? (
              <img
                src={`http://localhost:8070/${user.profilePicture}`}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover mr-2"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-2">
                {user?.name ? user.name[0] : "V"}
              </div>
            )}
            <span className="text-white">Welcome, {user?.name || "Vehicle Owner"}</span>
          </div>
          <ul className="absolute right-0 hidden group-hover:block bg-white shadow-lg rounded-md mt-2 z-10 w-48">
            <li className="px-4 py-2 text-gray-800 font-semibold">{user?.name || "Vehicle Owner"}</li>
            <li>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-100"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;