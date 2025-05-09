import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaSafari, FaDollarSign, FaCog, FaSignOutAlt, FaCompass, FaTruck, FaMapMarkedAlt } from "react-icons/fa";

const UserLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/LoginForm");
  };
 
  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="bg-blue-900 text-white w-64 flex-shrink-0 hidden md:block">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-white">Welcome User!</h2>
          <ul className="space-y-4">
            <li>
              <NavLink
                to="/user/dashboard"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    isActive ? "bg-blue-700 text-blue-100" : "text-blue-200 hover:bg-blue-700"
                  }`
                }
              >
                <FaTachometerAlt />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/user/safaris"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    isActive ? "bg-blue-700 text-blue-100" : "text-blue-200 hover:bg-blue-700"
                  }`
                }
              >
                <FaCompass />
                <span>Explore Safaris</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/user/trips"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    isActive ? "bg-blue-700 text-blue-100" : "text-blue-200 hover:bg-blue-700"
                  }`
                }
              >
                <FaSafari />
                <span>Trips</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/user/rentals"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    isActive ? "bg-blue-700 text-blue-100" : "text-blue-200 hover:bg-blue-700"
                  }`
                }
              >
                <FaTruck />
                <span>My Rentals</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/user/planner"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    isActive ? "bg-blue-700 text-blue-100" : "text-blue-200 hover:bg-blue-700"
                  }`
                }
              >
                <FaMapMarkedAlt />
                <span>AI Trip Planner</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/user/subscriptions"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    isActive ? "bg-blue-700 text-blue-100" : "text-blue-200 hover:bg-blue-700"
                  }`
                }
              >
                <FaDollarSign />
                <span>Subscriptions</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/user/settings"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    isActive ? "bg-blue-700 text-blue-100" : "text-blue-200 hover:bg-blue-700"
                  }`
                }
              >
                <FaCog />
                <span>Settings</span>
              </NavLink>
            </li>
          </ul>
        </div>
        <div
          className="p-6 flex items-center space-x-2 text-blue-200 hover:bg-blue-700 cursor-pointer"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          <span>Log Out</span>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-4">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default UserLayout;