import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaSafari, FaDollarSign, FaCog, FaSignOutAlt, FaComments } from "react-icons/fa";

const UserLayout = ({ children }) => {
  const navigate = useNavigate();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/LoginForm");
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="bg-blue-800 text-white w-64 flex-shrink-0 hidden md:block">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Welcome, User</h2>
          <ul className="space-y-4">
            <li>
              <NavLink
                to="/user/dashboard"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    isActive ? "bg-blue-700 text-blue-100" : "text-blue-200 hover:bg-blue-600"
                  }`
                }
              >
                <FaTachometerAlt />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/user/trips"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    isActive ? "bg-blue-700 text-blue-100" : "text-blue-200 hover:bg-blue-600"
                  }`
                }
              >
                <FaSafari />
                <span>Trips</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/user/subscriptions"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    isActive ? "bg-blue-700 text-blue-100" : "text-blue-200 hover:bg-blue-600"
                  }`
                }
              >
                <FaDollarSign />
                <span>Subscriptions</span>
              </NavLink>
            </li>
            <li>
              <div
                onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-blue-200 hover:bg-blue-600 cursor-pointer transition-colors"
              >
                <FaComments />
                <span>Feedback</span>
              </div>
              {isFeedbackOpen && (
                <ul className="ml-6 mt-2 space-y-2">
                  <li>
                    <NavLink
                      to="/user/feedback/form"
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-md transition-colors ${
                          isActive ? "bg-blue-700 text-blue-100" : "text-blue-200 hover:bg-blue-600"
                        }`
                      }
                    >
                      Feedback Form
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/user/feedback/inbox"
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-md transition-colors ${
                          isActive ? "bg-blue-700 text-blue-100" : "text-blue-200 hover:bg-blue-600"
                        }`
                      }
                    >
                      Inbox
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>
            <li>
              <NavLink
                to="/user/settings"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    isActive ? "bg-blue-700 text-blue-100" : "text-blue-200 hover:bg-blue-600"
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
          className="p-6 flex items-center space-x-2 text-blue-200 hover:bg-blue-600 cursor-pointer"
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