import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import defprofile from "../../Componets/assets/default-profile.png";

const Header = ({ user }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumUntil, setPremiumUntil] = useState(null);

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

  // Check premium status when component mounts
  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get("http://localhost:8070/users/premium/status", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setIsPremium(response.data.isPremium);
        setPremiumUntil(response.data.premiumUntil);
      } catch (error) {
        console.error("Error checking premium status:", error);
      }
    };

    checkPremiumStatus();
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
          <a href="/user/planner" className="hover:text-blue-200 transition-colors">AI Trip Planner</a>
          <a href="/about" className="hover:text-blue-200 transition-colors">About</a>
          <a href="/contact" className="hover:text-blue-200 transition-colors">Contact</a>
          <Link to="/user/subscriptions" className="hover:text-blue-200 transition-colors flex items-center">
            <span className="mr-1">✨</span> Premium 
            {isPremium && <span className="ml-1 px-2 py-0.5 bg-yellow-300 text-blue-800 text-xs rounded-full">ACTIVE</span>}
          </Link>
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
            <span className="text-white flex items-center">
              {user ? user.name : "Guest"}
              {isPremium && (
                <span className="ml-2 bg-yellow-300 text-xs px-1.5 py-0.5 rounded-full text-blue-800 font-bold">
                  PREMIUM
                </span>
              )}
            </span>
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
              <a href="/user/planner" className="block px-4 py-2 text-gray-800 hover:bg-blue-100">AI Trip Planner</a>
            </li>
            <li>
              <Link to="/user/subscriptions" className="block px-4 py-2 text-gray-800 hover:bg-blue-100 flex items-center justify-between">
                Premium Plans
                {isPremium ? (
                  <span className="bg-green-100 text-green-800 text-xs px-1 py-0.5 rounded-full">Active</span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-1 py-0.5 rounded-full">Upgrade</span>
                )}
              </Link>
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
      <div className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Safari Explorer</h1>
          <div className="flex items-center space-x-4">
            {isPremium ? (
              <div className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-md flex items-center">
                <span className="mr-1">✨</span> Premium Active
                <span className="ml-2 text-xs bg-white text-purple-700 px-1.5 py-0.5 rounded-full font-bold">15% OFF</span>
              </div>
            ) : (
              <Link 
                to="/user/subscriptions" 
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-md hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center"
              >
                <span className="mr-1">✨</span> Upgrade to Premium
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;