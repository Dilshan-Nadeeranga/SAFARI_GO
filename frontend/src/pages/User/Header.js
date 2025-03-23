// frontend/src/pages/User/Header.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import defprofile from "../../Componets/assets/default-profile.png";

const Header = ({ user }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  // Open dropdown on mouse enter
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current); // Clear any closing timeout
    }
    setIsDropdownOpen(true);
  };

  // Close dropdown with a delay on mouse leave
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300); // 300ms delay before closing
  };

  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/LoginForm");
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold">SafariGo</div>
        <nav className="hidden md:flex space-x-6">
          <a href="/UserHomepage" className="hover:text-blue-200 transition-colors">Home</a>
          <a href="/discover" className="hover:text-blue-200 transition-colors">Discover</a>
          <a href="/activities" className="hover:text-blue-200 transition-colors">Activities</a>
          <a href="/about" className="hover:text-blue-200 transition-colors">About</a>
          <a href="/contact" className="hover:text-blue-200 transition-colors">Contact</a>
        </nav>
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          ref={dropdownRef}
        >
          <div className="flex items-center cursor-pointer">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
              {user && user.profilePicture ? (
                <img
                  src={`http://localhost:8070/${user.profilePicture}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={defprofile}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <span className="text-white">{user ? user.name : "Guest"}</span>
          </div>
          <ul
            className={`absolute right-0 bg-white shadow-lg rounded-md mt-2 z-10 w-48 transition-opacity duration-200 ${
              isDropdownOpen ? "opacity-100 block" : "opacity-0 hidden"
            }`}
          >
            <li className="px-4 py-2 text-gray-800 font-semibold">{user ? user.name : "Guest"}</li>
            <li className="px-4 py-2 text-gray-600">Welcome, User</li>
            <li>
              <a href="/user/dashboard" className="block px-4 py-2 text-gray-800 hover:bg-blue-100">Dashboard</a>
            </li>
            <li>
              <a href="/user/trips" className="block px-4 py-2 text-gray-800 hover:bg-blue-100">Trips</a>
            </li>
            <li>
              <a href="/user/subscriptions" className="block px-4 py-2 text-gray-800 hover:bg-blue-100">Subscriptions</a>
            </li>
            <li>
              <a href="/user/settings" className="block px-4 py-2 text-gray-800 hover:bg-blue-100">Settings</a>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-100"
              >
                Log Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;